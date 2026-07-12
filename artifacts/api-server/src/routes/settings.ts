import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

async function ensureSettings() {
  const rows = await db.select().from(siteSettingsTable);
  if (!rows.length) {
    const [row] = await db.insert(siteSettingsTable).values({
      companyName: "EWAMA Properties Ltd",
      slogan: "Foundation of Trust",
      phone: "+254 720 769 999",
      email: "ewamapropertiesltd@gmail.com",
      whatsapp: "+254720769999",
      officeAddress: "Professional House, 4th Floor, Kiambu Town (opposite Kiambu Level 5 Hospital)",
      businessHours: "Mon–Fri: 8:00 AM – 5:00 PM · Sat: 9:00 AM – 1:00 PM · Sun & Public Holidays: By appointment",
      facebook: "https://www.facebook.com/p/Ewama-Properties-Ltd-100094290617746/",
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
