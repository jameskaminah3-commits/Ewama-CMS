import { Router } from "express";
import { db, propertiesTable, activityLogTable } from "@workspace/db";
import { eq, and, ilike, gte, lte, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { z } from "zod";

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = slugify(base);
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const existing = await db.select({ id: propertiesTable.id }).from(propertiesTable)
      .where(eq(propertiesTable.slug, candidate));
    if (!existing.length || (excludeId && existing[0]!.id === excludeId)) return candidate;
    attempt++;
  }
}

function mapProperty(p: typeof propertiesTable.$inferSelect) {
  return {
    ...p,
    gallery: (p.gallery as string[] | null) ?? [],
    availablePhases: (p.availablePhases as string[] | null) ?? [],
    amenities: (p.amenities as string[] | null) ?? [],
    investmentHighlights: (p.investmentHighlights as string[] | null) ?? [],
    nearbyLandmarks: (p.nearbyLandmarks as string[] | null) ?? [],
    cashPrice: parseFloat(p.cashPrice),
    installmentPrice: parseFloat(p.installmentPrice),
    titleDeedFee: p.titleDeedFee ? parseFloat(p.titleDeedFee) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// GET /properties/featured — must come before /:id
router.get("/featured", async (_req, res) => {
  const props = await db.select().from(propertiesTable)
    .where(and(eq(propertiesTable.featured, true), eq(propertiesTable.status, "available")))
    .orderBy(desc(propertiesTable.updatedAt))
    .limit(6);
  res.json(props.map(mapProperty));
});

// GET /properties/slug/:slug — must come before /:id
router.get("/slug/:slug", async (req, res) => {
  const [prop] = await db.select().from(propertiesTable)
    .where(eq(propertiesTable.slug, req.params["slug"] as string));
  if (!prop) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapProperty(prop));
});

// GET /properties
router.get("/", async (req, res) => {
  const { status, county, featured, minPrice, maxPrice, plotSize, search, page = "1", limit = "12" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: ReturnType<typeof eq>[] = [];
  if (status) conditions.push(eq(propertiesTable.status, status as any));
  if (county) conditions.push(ilike(propertiesTable.county, `%${county}%`));
  if (featured === "true") conditions.push(eq(propertiesTable.featured, true));
  if (search) conditions.push(
    sql`(${propertiesTable.name} ilike ${'%' + search + '%'} or ${propertiesTable.location} ilike ${'%' + search + '%'} or ${propertiesTable.county} ilike ${'%' + search + '%'})`
  );
  if (minPrice) conditions.push(gte(propertiesTable.cashPrice, minPrice));
  if (maxPrice) conditions.push(lte(propertiesTable.cashPrice, maxPrice));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [props, [{ count }]] = await Promise.all([
    db.select().from(propertiesTable).where(where).orderBy(desc(propertiesTable.updatedAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(where),
  ]);

  res.json({ data: props.map(mapProperty), total: count, page: pageNum, limit: limitNum });
});

// POST /properties
router.post("/", requireAuth, async (req, res) => {
  const { name, slug: rawSlug, ...rest } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  const slug = await uniqueSlug(rawSlug || name);
  const [prop] = await db.insert(propertiesTable).values({
    name, slug,
    county: rest.county ?? "",
    location: rest.location ?? "",
    cashPrice: String(rest.cashPrice ?? 0),
    installmentPrice: String(rest.installmentPrice ?? 0),
    ...rest,
    gallery: rest.gallery ?? [],
    availablePhases: rest.availablePhases ?? [],
    amenities: rest.amenities ?? [],
    investmentHighlights: rest.investmentHighlights ?? [],
    nearbyLandmarks: rest.nearbyLandmarks ?? [],
    titleDeedFee: rest.titleDeedFee ? String(rest.titleDeedFee) : null,
  }).returning();
  await db.insert(activityLogTable).values({ type: "property", description: `New property created: ${name}`, entityId: prop!.id, entityTitle: name });
  res.status(201).json(mapProperty(prop!));
});

// GET /properties/:id
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [prop] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
  if (!prop) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapProperty(prop));
});

// PATCH /properties/:id
router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const updates: Partial<typeof propertiesTable.$inferInsert> = { ...req.body, updatedAt: new Date() };
  if (updates.cashPrice !== undefined) updates.cashPrice = String(updates.cashPrice);
  if (updates.installmentPrice !== undefined) updates.installmentPrice = String(updates.installmentPrice);
  if (updates.titleDeedFee !== undefined) updates.titleDeedFee = updates.titleDeedFee ? String(updates.titleDeedFee) : null;
  if (req.body.name && !req.body.slug) {
    const [cur] = await db.select({ slug: propertiesTable.slug }).from(propertiesTable).where(eq(propertiesTable.id, id));
    if (cur) updates.slug = await uniqueSlug(req.body.name, id);
  }
  const [prop] = await db.update(propertiesTable).set(updates).where(eq(propertiesTable.id, id)).returning();
  if (!prop) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapProperty(prop));
});

// DELETE /properties/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
  res.status(204).send();
});

// POST /properties/:id/duplicate
router.post("/:id/duplicate", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [orig] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
  if (!orig) { res.status(404).json({ error: "Not found" }); return; }
  const { id: _id, createdAt: _ca, updatedAt: _ua, slug: _slug, ...rest } = orig;
  const newSlug = await uniqueSlug(`${orig.name}-copy`);
  const [prop] = await db.insert(propertiesTable).values({ ...rest, name: `${orig.name} (Copy)`, slug: newSlug, status: "draft", featured: false }).returning();
  res.status(201).json(mapProperty(prop!));
});

// POST /properties/:id/publish
router.post("/:id/publish", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [prop] = await db.update(propertiesTable).set({ status: "available", updatedAt: new Date() }).where(eq(propertiesTable.id, id)).returning();
  if (!prop) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityLogTable).values({ type: "property", description: `Property published: ${prop.name}`, entityId: prop.id, entityTitle: prop.name });
  res.json(mapProperty(prop));
});

// POST /properties/:id/archive
router.post("/:id/archive", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [prop] = await db.update(propertiesTable).set({ status: "archived", updatedAt: new Date() }).where(eq(propertiesTable.id, id)).returning();
  if (!prop) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapProperty(prop));
});

export { router as propertiesRouter };
