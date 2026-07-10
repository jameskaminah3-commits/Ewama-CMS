import { Router } from "express";
import { db, articlesTable, activityLogTable } from "@workspace/db";
import { eq, ilike, sql, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

async function uniqueSlug(base: string, excludeId?: number) {
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slugify(base) : `${slugify(base)}-${attempt}`;
    const rows = await db.select({ id: articlesTable.id }).from(articlesTable).where(eq(articlesTable.slug, candidate));
    if (!rows.length || (excludeId && rows[0]!.id === excludeId)) return candidate;
    attempt++;
  }
}

function calcReadingTime(content: string | null): number {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mapArticle(a: typeof articlesTable.$inferSelect) {
  return {
    ...a,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { status, category, search, page = "1", limit = "10" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (status) conditions.push(eq(articlesTable.status, status as any));
  if (category) conditions.push(eq(articlesTable.category, category));
  if (search) conditions.push(sql`(${articlesTable.title} ilike ${'%' + search + '%'})`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [articles, [{ count }]] = await Promise.all([
    db.select().from(articlesTable).where(where).orderBy(desc(articlesTable.updatedAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(articlesTable).where(where),
  ]);
  res.json({ data: articles.map(mapArticle), total: count, page: pageNum, limit: limitNum });
});

router.post("/", requireAuth, async (req, res) => {
  const { title, content, ...rest } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }
  const slug = await uniqueSlug(rest.slug || title);
  const readingTime = calcReadingTime(content);
  const [article] = await db.insert(articlesTable).values({ title, slug, content, readingTime, ...rest }).returning();
  await db.insert(activityLogTable).values({ type: "article", description: `New article created: ${title}`, entityId: article!.id, entityTitle: title });
  res.status(201).json(mapArticle(article!));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id));
  if (!article) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapArticle(article));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const updates: Partial<typeof articlesTable.$inferInsert> = { ...req.body, updatedAt: new Date() };
  if (req.body.content) updates.readingTime = calcReadingTime(req.body.content);
  const [article] = await db.update(articlesTable).set(updates).where(eq(articlesTable.id, id)).returning();
  if (!article) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapArticle(article));
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(articlesTable).where(eq(articlesTable.id, parseInt(req.params["id"] as string, 10)));
  res.status(204).send();
});

router.post("/:id/publish", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [article] = await db.update(articlesTable).set({ status: "published", publishedAt: new Date(), updatedAt: new Date() }).where(eq(articlesTable.id, id)).returning();
  if (!article) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityLogTable).values({ type: "article", description: `Article published: ${article.title}`, entityId: article.id, entityTitle: article.title });
  res.json(mapArticle(article));
});

export { router as articlesRouter };
