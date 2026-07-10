import type { User } from "@supabase/supabase-js";
import { db, adminUsersTable, type AdminUser } from "@workspace/db";
import { eq } from "drizzle-orm";

export function mapAdminUser(user: AdminUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

function displayNameFor(user: User) {
  const metadata = user.user_metadata ?? {};
  const name = metadata["full_name"] ?? metadata["name"];

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  return user.email?.split("@")[0] ?? "EWAMA Admin";
}

function avatarFor(user: User) {
  const avatarUrl = user.user_metadata?.["avatar_url"];
  return typeof avatarUrl === "string" ? avatarUrl : null;
}

function assertAllowedAdminEmail(email: string) {
  const allowlist = process.env["ADMIN_EMAIL_ALLOWLIST"]
    ?.split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist?.length && !allowlist.includes(email.toLowerCase())) {
    throw new Error("This Supabase user is not allowed to access the CMS.");
  }
}

export async function ensureAdminProfile(user: User) {
  if (!user.email) {
    throw new Error("Supabase user is missing an email address.");
  }

  assertAllowedAdminEmail(user.email);

  const [bySupabaseId] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.supabaseUserId, user.id));

  if (bySupabaseId) {
    return bySupabaseId;
  }

  const [byEmail] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, user.email));

  if (byEmail) {
    const [updated] = await db
      .update(adminUsersTable)
      .set({
        supabaseUserId: user.id,
        avatarUrl: byEmail.avatarUrl ?? avatarFor(user),
      })
      .where(eq(adminUsersTable.id, byEmail.id))
      .returning();

    return updated ?? byEmail;
  }

  const [created] = await db
    .insert(adminUsersTable)
    .values({
      supabaseUserId: user.id,
      email: user.email,
      passwordHash: null,
      name: displayNameFor(user),
      role: "admin",
      avatarUrl: avatarFor(user),
    })
    .returning();

  if (!created) {
    throw new Error("Unable to create admin profile.");
  }

  return created;
}

