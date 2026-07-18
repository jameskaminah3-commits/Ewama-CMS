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
    dbStatus = err instanceof Error ? `error: ${err.message}` : "error";
  }

  res.json({
    status: "ok",
    build,
    node: process.version,
    dbHost,
    dbStatus,
    currentDatabase,
    homepageContentTable,
  });
});

export default router;
