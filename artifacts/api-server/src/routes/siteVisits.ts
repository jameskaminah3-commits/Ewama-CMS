import { Router } from "express";
import { db, siteVisitsTable, activityLogTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

function mapVisit(v: typeof siteVisitsTable.$inferSelect) {
  return {
    ...v,
    preferredDate: v.preferredDate,
    rescheduledDate: v.rescheduledDate ?? null,
    createdAt: v.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  const where = status ? eq(siteVisitsTable.status, status as any) : undefined;
  const [data, [{ count }]] = await Promise.all([
    db.select().from(siteVisitsTable).where(where).orderBy(desc(siteVisitsTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(siteVisitsTable).where(where),
  ]);
  res.json({ data: data.map(mapVisit), total: count, page: pageNum, limit: limitNum });
});

router.post("/", async (req, res) => {
  const { name, email, phone, preferredDate, propertyId, propertyName, preferredTime } = req.body;
  if (!name || !email || !phone || !preferredDate) { res.status(400).json({ error: "Required fields missing" }); return; }
  const [visit] = await db.insert(siteVisitsTable).values({
    name, email, phone, preferredDate, propertyId: propertyId ?? null, propertyName: propertyName ?? null,
    preferredTime: preferredTime ?? null, status: "pending",
  }).returning();
  await db.insert(activityLogTable).values({ type: "site_visit", description: `Site visit requested by ${name}`, entityId: visit!.id, entityTitle: name });
  res.status(201).json(mapVisit(visit!));
});

router.get("/:id", requireAuth, async (req, res) => {
  const [visit] = await db.select().from(siteVisitsTable).where(eq(siteVisitsTable.id, parseInt(req.params["id"] as string, 10)));
  if (!visit) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapVisit(visit));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [visit] = await db.update(siteVisitsTable).set({ ...req.body }).where(eq(siteVisitsTable.id, id)).returning();
  if (!visit) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapVisit(visit));
});

export { router as siteVisitsRouter };
