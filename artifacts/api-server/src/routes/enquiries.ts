import { Router } from "express";
import { db, enquiriesTable, activityLogTable } from "@workspace/db";
import { eq, ilike, sql, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

function mapEnquiry(e: typeof enquiriesTable.$inferSelect) {
  return { ...e, createdAt: e.createdAt.toISOString() };
}

// GET /enquiries/export — before /:id
router.get("/export", requireAuth, async (_req, res) => {
  const enquiries = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
  const header = "ID,Name,Email,Phone,Property,Message,Status,Created";
  const rows = enquiries.map(e =>
    [e.id, `"${e.name}"`, `"${e.email}"`, `"${e.phone ?? ''}"`, `"${e.propertyName ?? ''}"`, `"${e.message.replace(/"/g, '""')}"`, e.status, e.createdAt.toISOString()].join(",")
  );
  res.json({ csv: [header, ...rows].join("\n") });
});

router.get("/", requireAuth, async (req, res) => {
  const { status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (status) conditions.push(eq(enquiriesTable.status, status as any));
  if (search) conditions.push(sql`(${enquiriesTable.name} ilike ${'%' + search + '%'} or ${enquiriesTable.email} ilike ${'%' + search + '%'})`);

  const where = conditions.length ? and(...conditions) : undefined;
  const [data, [{ count }], [{ unread }]] = await Promise.all([
    db.select().from(enquiriesTable).where(where).orderBy(desc(enquiriesTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(enquiriesTable).where(where),
    db.select({ unread: sql<number>`count(*)::int` }).from(enquiriesTable).where(eq(enquiriesTable.status, "unread")),
  ]);
  res.json({ data: data.map(mapEnquiry), total: count, page: pageNum, limit: limitNum, unreadCount: unread });
});

router.post("/", async (req, res) => {
  const { name, email, message, phone, propertyId, propertyName } = req.body;
  if (!name || !email || !message) { res.status(400).json({ error: "name, email, message are required" }); return; }
  const [enq] = await db.insert(enquiriesTable).values({ name, email, phone: phone ?? null, message, propertyId: propertyId ?? null, propertyName: propertyName ?? null, status: "unread" }).returning();
  await db.insert(activityLogTable).values({ type: "enquiry", description: `New enquiry from ${name}`, entityId: enq!.id, entityTitle: name });
  res.status(201).json(mapEnquiry(enq!));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [enq] = await db.select().from(enquiriesTable).where(eq(enquiriesTable.id, id));
  if (!enq) { res.status(404).json({ error: "Not found" }); return; }
  // Auto-mark as read
  if (enq.status === "unread") {
    await db.update(enquiriesTable).set({ status: "read" }).where(eq(enquiriesTable.id, id));
    enq.status = "read";
  }
  res.json(mapEnquiry(enq));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [enq] = await db.update(enquiriesTable).set({ ...req.body }).where(eq(enquiriesTable.id, id)).returning();
  if (!enq) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapEnquiry(enq));
});

export { router as enquiriesRouter };
