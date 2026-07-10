import { Router } from "express";
import { db, siteSettingsTable, homepageContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

async function ensureSettings() {
  const rows = await db.select().from(siteSettingsTable);
  if (!rows.length) {
    const [row] = await db.insert(siteSettingsTable).values({
      companyName: "EWAMA Properties Ltd",
      slogan: "Foundation of Trust",
      phone: "0720 769 999",
      email: "info@ewamaproperties.co.ke",
      whatsapp: "+254720769999",
      officeAddress: "Nairobi, Kenya",
      businessHours: "Mon–Fri 8am–6pm, Sat 9am–4pm",
    }).returning();
    return row!;
  }
  return rows[0]!;
}

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

// GET /settings
router.get("/", async (_req, res) => {
  const settings = await ensureSettings();
  res.json({ ...settings, updatedAt: settings.updatedAt.toISOString() });
});

// PATCH /settings
router.patch("/", requireAuth, async (req, res) => {
  const settings = await ensureSettings();
  const [result] = await db.update(siteSettingsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(siteSettingsTable.id, settings.id)).returning();
  res.json({ ...result!, updatedAt: result!.updatedAt.toISOString() });
});

export { router as settingsRouter };
