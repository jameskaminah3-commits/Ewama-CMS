import crypto from "node:crypto";
import { db, adminUsersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { supabaseAdmin } from "./supabase.js";

/**
 * Self-contained admin credential checks — independent of Supabase Auth.
 *
 * Two ways to be an admin:
 *   1. Environment master admin: ADMIN_EMAIL + ADMIN_PASSWORD in the server
 *      env. Simplest, most robust — always works regardless of the database
 *      or Supabase state.
 *   2. A row in admin_users with a scrypt password hash (set by the admin
 *      themselves from Settings or via the emailed reset code).
 *
 * Password hashing uses Node's built-in scrypt, so there is no native or
 * external dependency to install on the host.
 */

/** The admin columns login needs. Deliberately excludes the reset-code
 *  columns so a missing/older column can never block signing in. */
const coreColumns = {
  id: adminUsersTable.id,
  email: adminUsersTable.email,
  passwordHash: adminUsersTable.passwordHash,
  name: adminUsersTable.name,
  role: adminUsersTable.role,
  avatarUrl: adminUsersTable.avatarUrl,
  createdAt: adminUsersTable.createdAt,
};

export type CoreAdmin = {
  id: number;
  email: string;
  passwordHash: string | null;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date | string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Case-insensitive email match, so "Info@…" and "info@…" are the same admin. */
const emailMatches = (email: string) => sql`lower(${adminUsersTable.email}) = ${normalizeEmail(email)}`;

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
  if (!salt.length || !expected.length) return false;
  const actual = crypto.scryptSync(password, salt, expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Clean a value pasted into cPanel: stray whitespace/newlines and wrapping quotes. */
function cleanEnvValue(raw: string | undefined): string {
  let v = (raw ?? "").trim();
  if (v.length >= 2 && (v[0] === '"' || v[0] === "'") && v[v.length - 1] === v[0]) v = v.slice(1, -1).trim();
  return v;
}

/**
 * The env master admin(s). ADMIN_EMAIL and ADMIN_PASSWORD may each hold one
 * value or a comma-separated list (e.g. two admins, or two passwords). The
 * full ADMIN_PASSWORD value is always accepted too, so a single password
 * that happens to contain a comma still works.
 */
function envAdmin(): { emails: string[]; passwords: string[] } | null {
  const emails = cleanEnvValue(process.env["ADMIN_EMAIL"])
    .split(",")
    .map((e) => cleanEnvValue(e).toLowerCase())
    .filter(Boolean);
  const full = cleanEnvValue(process.env["ADMIN_PASSWORD"]);
  if (!emails.length || !full) return null;
  const parts = full.split(",").map((p) => cleanEnvValue(p)).filter(Boolean);
  return { emails, passwords: Array.from(new Set([full, ...parts])) };
}

export function isEnvAdminEmail(email: string): boolean {
  return envAdmin()?.emails.includes(normalizeEmail(email)) ?? false;
}

/** Safe summary for /api/health — never reveals the password itself. */
export function envAdminSummary() {
  const env = envAdmin();
  if (!env) return { configured: false };
  const mask = (e: string) => {
    const [user = "", domain = ""] = e.split("@");
    return `${user.slice(0, 2)}***@${domain}`;
  };
  return {
    configured: true,
    emails: env.emails.map(mask),
    passwordCount: cleanEnvValue(process.env["ADMIN_PASSWORD"]).split(",").filter((p) => p.trim()).length,
  };
}

function matchesEnvAdmin(email: string, password: string): boolean {
  const env = envAdmin();
  if (!env || !env.emails.includes(email)) return false;
  const candidates = [password, password.trim()];
  return env.passwords.some((p) => candidates.some((c) => constantTimeEqual(c, p)));
}

export async function findAdminByEmail(email: string): Promise<CoreAdmin | null> {
  const [row] = await db.select(coreColumns).from(adminUsersTable).where(emailMatches(email));
  return row ?? null;
}

/** Find an admin_users row by email, creating one if it doesn't exist yet. */
export async function upsertAdminByEmail(email: string, name?: string): Promise<CoreAdmin> {
  const normalized = normalizeEmail(email);
  const existing = await findAdminByEmail(normalized);
  if (existing) return existing;

  const [created] = await db
    .insert(adminUsersTable)
    .values({
      email: normalized,
      name: name || normalized.split("@")[0] || "EWAMA Admin",
      role: "admin",
      passwordHash: null,
      supabaseUserId: null,
    })
    .returning(coreColumns);

  if (!created) throw new Error("Unable to create admin profile");
  return created;
}

/**
 * Verify credentials: the env master admin first (needs no database, exactly
 * like the original login), then a password the admin set themselves.
 */
export async function verifyLocalAdmin(email: string, password: string): Promise<CoreAdmin | null> {
  const normalized = normalizeEmail(email);

  if (matchesEnvAdmin(normalized, password)) {
    return adminProfileOrFallback(normalized);
  }

  // A database hiccup must never break sign-in, so the lookup is isolated.
  try {
    const row = await findAdminByEmail(normalized);
    if (row?.passwordHash && verifyPassword(password, row.passwordHash)) return row;
  } catch (err) {
    logger.error({ err }, "Admin lookup failed during sign-in");
  }

  return null;
}

/** The admin's profile row, or — if the database can't be reached — a minimal
 *  profile so a verified admin can still sign in. */
export async function adminProfileOrFallback(email: string): Promise<CoreAdmin> {
  try {
    return await upsertAdminByEmail(email);
  } catch (err) {
    logger.error({ err }, "Could not load admin profile; signing in without it");
    return { id: 0, email, passwordHash: null, name: "EWAMA Admin", role: "admin", avatarUrl: null, createdAt: new Date() };
  }
}

/** For admins who still sign in through Supabase Auth: check their password there. */
export async function verifySupabasePassword(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email: normalizeEmail(email), password });
    return !error && !!data.user;
  } catch {
    return false;
  }
}

/** Set (or replace) an admin's self-managed password. Creates the row if needed. */
export async function setAdminPassword(email: string, newPassword: string): Promise<void> {
  const admin = await upsertAdminByEmail(email);
  await db
    .update(adminUsersTable)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(adminUsersTable.id, admin.id));

  // Burn any outstanding reset code. Kept separate so the password change
  // still succeeds even if the reset columns are unavailable.
  try {
    await db
      .update(adminUsersTable)
      .set({ resetCodeHash: null, resetExpiresAt: null })
      .where(eq(adminUsersTable.id, admin.id));
  } catch (err) {
    logger.warn({ err }, "Could not clear reset code after password change");
  }
}

function isAllowedResetEmail(email: string): boolean {
  const allowlist = process.env["ADMIN_EMAIL_ALLOWLIST"]?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (isEnvAdminEmail(email)) return true;
  if (allowlist?.length) return allowlist.includes(email);
  return false;
}

/**
 * Generate a 6-digit code for the admin, store its hash + 15-minute expiry, and
 * return the plain code to email. Returns null if the email isn't an admin
 * (caller should still respond success so existence isn't leaked).
 */
export async function createResetCode(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  // Only the env master admin, allowlisted emails, or admins already in the
  // dashboard can receive a code — never an arbitrary address.
  const existing = await findAdminByEmail(normalized);
  if (!existing && !isAllowedResetEmail(normalized)) return null;

  const admin = existing ?? (await upsertAdminByEmail(normalized));
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  await db
    .update(adminUsersTable)
    .set({ resetCodeHash: hashPassword(code), resetExpiresAt: expires })
    .where(eq(adminUsersTable.id, admin.id));
  return code;
}

/** Verify a reset code is correct and unexpired. */
export async function verifyResetCode(email: string, code: string): Promise<boolean> {
  const [row] = await db
    .select({ resetCodeHash: adminUsersTable.resetCodeHash, resetExpiresAt: adminUsersTable.resetExpiresAt })
    .from(adminUsersTable)
    .where(emailMatches(email));
  if (!row?.resetCodeHash || !row.resetExpiresAt) return false;
  if (new Date(row.resetExpiresAt).getTime() < Date.now()) return false;
  return verifyPassword(code, row.resetCodeHash);
}
