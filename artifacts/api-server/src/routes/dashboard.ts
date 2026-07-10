import { Router } from "express";
import { db, propertiesTable, articlesTable, enquiriesTable, siteVisitsTable, activityLogTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
  const [
    [{ total }],
    [{ published }],
    [{ unread }],
    [{ pending }],
    [{ featured }],
    [{ available }],
  ] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(propertiesTable).where(sql`status != 'archived'`),
    db.select({ published: sql<number>`count(*)::int` }).from(articlesTable).where(eq(articlesTable.status, "published")),
    db.select({ unread: sql<number>`count(*)::int` }).from(enquiriesTable).where(eq(enquiriesTable.status, "unread")),
    db.select({ pending: sql<number>`count(*)::int` }).from(siteVisitsTable).where(eq(siteVisitsTable.status, "pending")),
    db.select({ featured: sql<number>`count(*)::int` }).from(propertiesTable).where(eq(propertiesTable.featured, true)),
    db.select({ available: sql<number>`count(*)::int` }).from(propertiesTable).where(eq(propertiesTable.status, "available")),
  ]);

  res.json({
    totalProperties: total,
    publishedArticles: published,
    unreadEnquiries: unread,
    pendingSiteVisits: pending,
    featuredProperties: featured,
    availableProperties: available,
  });
});

router.get("/activity", requireAuth, async (_req, res) => {
  const items = await db.select().from(activityLogTable).orderBy(desc(activityLogTable.createdAt)).limit(20);
  res.json(items.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })));
});

export { router as dashboardRouter };
