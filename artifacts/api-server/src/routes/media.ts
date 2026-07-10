import { Router } from "express";
import { db, mediaTable } from "@workspace/db";
import { eq, ilike, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

function mapMedia(m: typeof mediaTable.$inferSelect) {
  return { ...m, createdAt: m.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const { search, page = "1", limit = "24" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  const where = search ? ilike(mediaTable.fileName, `%${search}%`) : undefined;
  const [data, [{ count }]] = await Promise.all([
    db.select().from(mediaTable).where(where).orderBy(desc(mediaTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(mediaTable).where(where),
  ]);
  res.json({ data: data.map(mapMedia), total: count, page: pageNum, limit: limitNum });
});

router.post("/", requireAuth, async (req, res) => {
  const { fileName, url, mimeType, size, thumbnailUrl, altText } = req.body;
  if (!fileName || !url || !mimeType || size === undefined) {
    res.status(400).json({ error: "fileName, url, mimeType, size are required" });
    return;
  }
  const [media] = await db.insert(mediaTable).values({ fileName, url, mimeType, size, thumbnailUrl: thumbnailUrl ?? null, altText: altText ?? null }).returning();
  res.status(201).json(mapMedia(media!));
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(mediaTable).where(eq(mediaTable.id, parseInt(req.params["id"] as string, 10)));
  res.status(204).send();
});

export { router as mediaRouter };
