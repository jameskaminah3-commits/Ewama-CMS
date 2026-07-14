import { Router } from "express";
import { db, homepageContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

async function ensureHomepage() {
  const rows = await db.select().from(homepageContentTable);
  if (!rows.length) {
    const [row] = await db.insert(homepageContentTable).values({
      heroHeading: "Secure Your Future Through Smart Property Investment",
      heroSubheading: "We believe land and property ownership should be accessible, transparent, and rewarding — whether you are purchasing your first plot, building your dream home, or expanding your investment portfolio. Own Today. Prosper Tomorrow.",
      heroButtonText: "Explore Properties",
      heroButtonLink: "/properties",
      mission: "To transform dreams into reality by providing transparent, customer-centered, and sustainable real estate solutions that inspire trust, create wealth, and build thriving communities.",
      vision: "Building a future where every family and investor confidently owns a piece of tomorrow.",
      statsYearsInBusiness: 5,
      statsPropertiesSold: 500,
      statsHappyClients: 450,
      statsCountiesCovered: 8,
      communityImpact: "Through our community-focused initiatives and commitment to social responsibility, we have helped settle more than ten families, enabling them to secure stable living environments and new opportunities for growth. Because true success is measured by the difference we make in people's lives.",
      footerCta: "Ready to invest in your future? Speak to our team today.",
      heroBadge: "Foundation of Trust",
      ctaHeading: "Ready to Invest in Your Future?",
      ctaSubheading: "Whether you're purchasing your first property, building your dream home, or expanding your investment portfolio, EWAMA is here to guide you every step of the way. Join hundreds of clients who trust EWAMA as their partner in property ownership and wealth creation.",
      advantages: [
        { title: "Verified & Secure Properties", description: "We prioritise due diligence to ensure that every property we offer meets legal and ownership requirements, giving our clients confidence and peace of mind." },
        { title: "Transparent Processes", description: "From inquiry to ownership, we maintain open communication and clear documentation, ensuring a smooth and trustworthy experience." },
        { title: "Flexible Investment Opportunities", description: "Whether you're a first-time buyer, homeowner, or seasoned investor, we offer property options designed to suit diverse needs and budgets." },
        { title: "Customer-Centered Service", description: "Our clients are at the heart of everything we do. We listen, guide, and support every customer with professionalism and care." },
        { title: "Strategic Locations", description: "We identify properties in promising growth areas with strong potential for appreciation and future development." },
        { title: "Long-Term Value", description: "Our focus extends beyond transactions. We help clients secure investments that contribute to financial growth and generational wealth." },
      ],
      processSteps: [
        { title: "Explore Opportunities", description: "Browse our available properties and identify options that align with your goals." },
        { title: "Speak With Our Advisors", description: "Consult with our team to gain detailed information and professional guidance." },
        { title: "Visit the Property", description: "Participate in a site visit to evaluate the property and its surroundings." },
        { title: "Secure Your Investment", description: "Complete the purchase process through clear and transparent documentation." },
        { title: "Begin Building Your Future", description: "Take ownership of your property and start turning your dreams into reality." },
      ],
      testimonials: [
        { quote: "EWAMA made the entire property acquisition process straightforward and transparent. Their professionalism gave us confidence from the beginning.", name: "Verified Client", role: "Property acquisition" },
        { quote: "From the site visit to ownership, the team was supportive, honest, and responsive. We highly recommend EWAMA.", name: "Verified Client", role: "Site visit to ownership" },
        { quote: "We were looking for a secure investment opportunity, and EWAMA helped us find exactly what we needed.", name: "Verified Client", role: "Investment purchase" },
      ],
      heroSlides: [
        {
          kicker: "EWAMA PROPERTIES LTD",
          title: "Secure Your Future Through Smart Property Investment",
          text: "We make land and property ownership accessible, transparent, and rewarding — whether you are purchasing your first plot, building your dream home, or expanding your portfolio.",
          image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
          ctaLabel: "Explore Properties",
          ctaHref: "/properties",
        },
        {
          kicker: "EWAMA PROPERTIES LTD",
          title: "Own Today. Prosper Tomorrow.",
          text: "Prime value-added plots with title deeds guaranteed, in Kenya's fastest-growing regions.",
          image: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
          ctaLabel: "Book a Site Visit",
          ctaHref: "/book-site-visit",
        },
        {
          kicker: "A FOUNDATION OF TRUST",
          title: "Karibu EWAMA Properties",
          text: "Visit our Customer Care Centre on Kiambu Road — our team is ready to walk you home.",
          image: "/office-reception.webp",
          ctaLabel: "Talk to Us",
          ctaHref: "/contact",
        },
      ],
      approachText: "Finding the right piece of land is personal. We listen first, then guide you through every step — from your first site visit to the day you receive your title deed.",
      approachQuote: "We don't just sell plots. We help families find the place where their best memories will be made.",
      whatYouGet: [
        "Verified property ownership",
        "Transparent pricing",
        "Professional customer support",
        "Flexible payment plans",
        "Strategic investment locations",
        "Dedicated guidance throughout the buying process",
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
