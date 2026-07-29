import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

declare const __BUILD_TIME__: string | undefined;

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Deployment diagnostic: reports which build is running and what the database
// looks like over the app's own connection. Exposes no credentials — only the
// DB hostname and table visibility.
router.get("/health", async (_req, res) => {
  const build = typeof __BUILD_TIME__ === "string" ? __BUILD_TIME__ : "dev";

  let dbHost = "unset";
  try {
    if (process.env["DATABASE_URL"]) dbHost = new URL(process.env["DATABASE_URL"]).hostname;
  } catch {
    dbHost = "unparseable";
  }

  let dbStatus = "ok";
  let homepageContentTable: string | null = null;
  let currentDatabase: string | null = null;
  try {
    const result = await db.execute(sql`
      SELECT current_database() AS db,
             to_regclass('public.homepage_content')::text AS homepage_content
    `);
    const row = (result as unknown as { rows?: Record<string, unknown>[] }).rows?.[0]
      ?? (Array.isArray(result) ? (result as Record<string, unknown>[])[0] : undefined);
    currentDatabase = (row?.["db"] as string) ?? null;
    homepageContentTable = (row?.["homepage_content"] as string | null) ?? null;
  } catch (err) {
    // Unwrap the cause chain: drizzle's "Failed query" wrapper hides the real
    // Postgres error (relation missing, connection refused, auth) in .cause.
    const parts: string[] = [];
    let cur: unknown = err;
    while (cur instanceof Error) {
      const code = (cur as { code?: unknown }).code;
      parts.push(code !== undefined ? `[${String(code)}] ${cur.message}` : cur.message);
      cur = cur.cause;
    }
    dbStatus = `error: ${parts.join(" <- ") || "unknown"}`;
  }

  // Probe admin_users exactly as the login code reads it, so a missing column
  // (the usual cause of a 403 on sign-in) is named right here in the response.
  let adminUsersStatus = "ok";
  try {
    await db.execute(sql`
      SELECT id, supabase_user_id, email, password_hash, name, role, avatar_url, created_at
      FROM admin_users LIMIT 1
    `);
  } catch (err) {
    const parts: string[] = [];
    let cur: unknown = err;
    while (cur instanceof Error) {
      const code = (cur as { code?: unknown }).code;
      parts.push(code !== undefined ? `[${String(code)}] ${cur.message}` : cur.message);
      cur = cur.cause;
    }
    adminUsersStatus = `error: ${parts.join(" <- ") || "unknown"}`;
  }

  res.json({
    status: "ok",
    build,
    node: process.version,
    dbHost,
    dbStatus,
    currentDatabase,
    homepageContentTable,
    adminUsersStatus,
    adminEnvConfigured: Boolean(process.env["ADMIN_EMAIL"] && process.env["ADMIN_PASSWORD"]),
  });
});

export default router;
