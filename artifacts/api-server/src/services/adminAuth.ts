import crypto from "node:crypto";
import { db, adminUsersTable, type AdminUser } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Self-contained admin credential checks — independent of Supabase Auth.
 *
 * Two ways to be an admin:
 *   1. Environment master admin: ADMIN_EMAIL + ADMIN_PASSWORD in the server
 *      env. Simplest, most robust — always works regardless of the database
 *      or Supabase state.
 *   2. A row in admin_users with a scrypt password hash (for extra admins
 *      created later from the dashboard).
 *
 * Password hashing uses Node's built-in scrypt, so there is no native or
 * external dependency to install on the host.
 */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1]!, "hex");
  const expected = Buffer.from(parts[2]!, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Find an admin_users row by email, creating one if it doesn't exist yet. */
export async function upsertAdminByEmail(email: string, name?: string): Promise<AdminUser> {
  const [existing] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (existing) return existing;

  const [created] = await db
    .insert(adminUsersTable)
    .values({
      email,
      name: name || email.split("@")[0] || "EWAMA Admin",
      role: "admin",
      passwordHash: null,
      supabaseUserId: null,
    })
    .returning();

  if (!created) throw new Error("Unable to create admin profile");
  return created;
}

/**
 * Verify credentials against the env master admin first, then any admin_users
 * row that has a scrypt password hash. Returns the admin row on success.
 */
export async function verifyLocalAdmin(email: string, password: string): Promise<AdminUser | null> {
  // A self-managed password stored in the database takes precedence, so once an
  // admin sets their own password it is used. The env master admin remains as a
  // developer-set bootstrap / emergency login.
  const [row] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (row?.passwordHash && verifyPassword(password, row.passwordHash)) {
    return row;
  }

  const envEmail = process.env["ADMIN_EMAIL"]?.trim().toLowerCase();
  const envPassword = process.env["ADMIN_PASSWORD"];
  if (envEmail && envPassword && email === envEmail && constantTimeEqual(password, envPassword)) {
    return upsertAdminByEmail(email);
  }

  return null;
}

/** Set (or replace) an admin's self-managed password. Creates the row if needed. */
export async function setAdminPassword(email: string, newPassword: string): Promise<void> {
  await upsertAdminByEmail(email);
  await db
    .update(adminUsersTable)
    .set({ passwordHash: hashPassword(newPassword), resetCodeHash: null, resetExpiresAt: null })
    .where(eq(adminUsersTable.email, email));
}

function isAllowedResetEmail(email: string): boolean {
  const envEmail = process.env["ADMIN_EMAIL"]?.trim().toLowerCase();
  const allowlist = process.env["ADMIN_EMAIL_ALLOWLIST"]?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (envEmail && email === envEmail) return true;
  if (allowlist?.length) return allowlist.includes(email);
  return true; // no allowlist configured — any known admin may reset
}

/**
 * Generate a 6-digit code for the admin, store its hash + 15-minute expiry, and
 * return the plain code to email. Returns null if the email isn't an allowed
 * admin (caller should still respond success so existence isn't leaked).
 */
export async function createResetCode(email: string): Promise<string | null> {
  if (!isAllowedResetEmail(email)) return null;
  await upsertAdminByEmail(email); // ensure a row exists for env/first-time admins
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  await db
    .update(adminUsersTable)
    .set({ resetCodeHash: hashPassword(code), resetExpiresAt: expires })
    .where(eq(adminUsersTable.email, email));
  return code;
}

/** Verify a reset code is correct and unexpired. */
export async function verifyResetCode(email: string, code: string): Promise<boolean> {
  const [row] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (!row?.resetCodeHash || !row.resetExpiresAt) return false;
  if (new Date(row.resetExpiresAt).getTime() < Date.now()) return false;
  return verifyPassword(code, row.resetCodeHash);
}
