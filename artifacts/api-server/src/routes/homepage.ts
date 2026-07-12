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
      heroBadge: "Foundation of Trust",
      ctaHeading: "Ready to Secure Your Piece of Kenya?",
      ctaSubheading: "Join hundreds of smart investors who trust EWAMA Properties. Schedule a free consultation or book a site visit today.",
      advantages: [
        { title: "Secure & Verified", description: "Every property we sell has undergone rigorous due diligence. We guarantee genuine, ready title deeds." },
        { title: "Investment Grade", description: "We select land in high-growth corridors positioned for maximum appreciation and development potential." },
        { title: "Transparent Process", description: "No hidden fees, no rushed decisions. We walk you through every step of the buying process with clarity." },
      ],
      processSteps: [
        { title: "Explore & Enquire", description: "Browse our vetted properties online or speak to an advisor about your investment goals." },
        { title: "Visit the Site", description: "Book a free guided site visit and see the land, beacons, and surrounding developments for yourself." },
        { title: "Secure Your Plot", description: "Pay a deposit or the full amount to official EWAMA accounts and sign your sale agreement." },
        { title: "Receive Your Title", description: "We process and hand over your genuine title deed — your ownership, fully documented." },
      ],
      testimonials: [
        { quote: "The title deed was ready exactly as promised. From site visit to transfer, everything was clear and professional. I never felt rushed or pressured.", name: "Client, Naivasha project", role: "Plot owner since 2023" },
        { quote: "Buying land from abroad felt risky until I worked with EWAMA. They handled everything transparently and kept me updated at every step.", name: "Diaspora investor, UK", role: "Sagana Phase 1" },
        { quote: "The installment plan made ownership possible for my family. No hidden charges — the price we agreed is the price we paid.", name: "Client, Matuu project", role: "Plot owner since 2024" },
      ],
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
  const { id: _id, updatedAt: _ua, ...updates } = req.body ?? {};
  const [result] = await db.update(homepageContentTable).set({ ...updates, updatedAt: new Date() }).where(eq(homepageContentTable.id, content.id)).returning();
  res.json({ ...result!, updatedAt: result!.updatedAt.toISOString() });
});

export { router as homepageRouter };
