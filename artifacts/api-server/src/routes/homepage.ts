import { Router } from "express";
import { db, homepageContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

async function ensureHomepage() {
  const rows = await db.select().from(homepageContentTable);
  if (!rows.length) {
    const [row] = await db.insert(homepageContentTable).values({
      heroHeading: "Own Your Piece of Kenya",
      heroSubheading: "Trusted land investments across Kenya — transparent pricing, genuine title deeds, free site visits.",
      heroButtonText: "View Properties",
      heroButtonLink: "/properties",
      mission: "To provide accessible, transparent and trustworthy land investment opportunities that empower Kenyans to build lasting wealth.",
      vision: "To be the most trusted land company in Kenya — known for integrity, transparency and community impact.",
      statsYearsInBusiness: 5,
      statsPropertiesSold: 500,
      statsHappyClients: 450,
      statsCountiesCovered: 8,
      communityImpact: "We believe in building communities, not just selling land. Every plot we sell contributes to the growth of a vibrant, thriving Kenyan community.",
      footerCta: "Ready to invest? Speak to our team today.",
    }).returning();
    return row!;
  }
  return rows[0]!;
}

// GET /homepage
router.get("/", async (_req, res) => {
  const content = await ensureHomepage();
  res.json({ ...content, updatedAt: content.updatedAt.toISOString() });
});

// PATCH /homepage
router.patch("/", requireAuth, async (req, res) => {
  const content = await ensureHomepage();
  const [result] = await db.update(homepageContentTable).set({ ...req.body, updatedAt: new Date() }).where(eq(homepageContentTable.id, content.id)).returning();
  res.json({ ...result!, updatedAt: result!.updatedAt.toISOString() });
});

export { router as homepageRouter };
