/**
 * Seeds EWAMA's real project catalog and launch content into the database.
 *
 * Safe to run repeatedly: rows are matched by slug and skipped if they
 * already exist, so admin edits are never overwritten.
 *
 * Usage (from repo root, with .env configured):
 *   corepack pnpm --filter @workspace/scripts run seed
 */
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { db, pool, propertiesTable, articlesTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");

  type PropertySeed = Omit<typeof propertiesTable.$inferInsert, "id" | "createdAt" | "updatedAt">;

  const properties: PropertySeed[] = [
    {
      name: "EWAMA Kimana – Imbirikani",
      slug: "ewama-kimana-imbirikani",
      county: "Kajiado",
      location: "Imbirikani, Kimana",
      plotSize: "50x100 ft",
      cashPrice: "195000",
      installmentPrice: "220000",
      status: "available",
      featured: true,
      shortDescription:
        "Own a piece of tomorrow in the heart of Kajiado County. Affordable 50 × 100 plots in a peaceful, rapidly developing location just five minutes off the Emali–Loitokitok Highway — beaconed, fenced, and ready for your future.",
      fullDescription:
        "Imagine owning land in one of Kenya's most promising growth corridors, where breathtaking views, expanding infrastructure, and increasing investment opportunities come together to create exceptional long-term value.\n\nEWAMA Kimana – Imbirikani is located in the serene and fast-growing Imbirikani area of Kajiado County, only five minutes from the Emali–Loitokitok Highway. The development combines accessibility, affordability, and long-term investment potential, making it ideal for both first-time buyers and seasoned investors.\n\nEach plot has been carefully planned, beaconed, and secured to provide buyers with confidence and peace of mind.\n\nKimana has become one of Kenya's emerging investment destinations due to its strategic location, expanding infrastructure, and growing demand for residential and commercial development. Its proximity to Amboseli National Park, the Tanzania border, and major transport routes makes the area increasingly attractive for homeowners, tourism-related developments, and long-term investors seeking future appreciation.\n\nIdeal for: family homes, holiday residences, rental developments, small commercial projects, and future investment.",
      amenities: [
        "Securely beaconed plots",
        "Well-fenced development",
        "Convenient road access",
        "Peaceful natural surroundings",
        "Transparent ownership process",
      ],
      investmentHighlights: [
        "Approximately 5 minutes from the Emali–Loitokitok Highway",
        "Proximity to Amboseli National Park and the Tanzania border",
        "One of Kenya's emerging investment destinations",
        "Expanding infrastructure and growing demand",
        "Strong potential for future appreciation",
      ],
      phasePricing: [
        { phase: "Phase IV", cashPrice: 195000, installmentPrice: 220000 },
        { phase: "Phase V", cashPrice: 195000, installmentPrice: 220000 },
      ],
      faqs: [
        { question: "Are the plots beaconed?", answer: "Yes. Every plot is professionally beaconed for easy identification." },
        { question: "Is the project fenced?", answer: "Yes. The development is well fenced to enhance organisation and security." },
        { question: "How far is the property from the main road?", answer: "The project is located approximately five minutes from the Emali–Loitokitok Highway." },
        { question: "Can I pay in installments?", answer: "Yes. Flexible installment payment options are available." },
        { question: "Can I visit before purchasing?", answer: "Absolutely. We encourage every client to schedule a site visit before making an investment decision." },
        { question: "What documents will I receive?", answer: "Our team will guide you through the documentation process and explain all ownership requirements before completing your purchase." },
      ],
    },
    {
      name: "EWAMA Sagana",
      slug: "ewama-sagana",
      county: "Kirinyaga",
      location: "Sagana, off Kenol–Nyeri Highway",
      plotSize: "50x100 ft",
      cashPrice: "700000",
      installmentPrice: "950000",
      status: "available",
      featured: true,
      shortDescription:
        "Invest along the Kenol–Nyeri growth corridor. Located approximately 100 metres from the Kenol–Nyeri Highway, our Sagana development combines accessibility with strong appreciation potential.",
      fullDescription:
        "Our Sagana development sits approximately 100 metres from the Kenol–Nyeri Highway, placing it firmly on one of central Kenya's most promising growth corridors.\n\nThe project offers 50 × 100 plots with water and electricity available, fertile red soil, and secure fencing — suitable for both residential and commercial development.\n\nWith excellent accessibility and infrastructure continuing to improve along the corridor, Sagana combines convenience today with strong appreciation potential tomorrow.",
      amenities: [
        "Water and electricity available",
        "Red soil",
        "Well fenced",
        "Close to the highway",
      ],
      investmentHighlights: [
        "Approximately 100 metres from the Kenol–Nyeri Highway",
        "On the Kenol–Nyeri growth corridor",
        "Suitable for residential and commercial development",
        "Strong appreciation potential",
      ],
      phasePricing: [
        { phase: "Phase I", cashPrice: 850000, installmentPrice: 895000 },
        { phase: "Phase II", cashPrice: 700000, installmentPrice: 950000 },
      ],
      faqs: [],
    },
    {
      name: "EWAMA Joska",
      slug: "ewama-joska",
      county: "Machakos",
      location: "Joska, Sunshine",
      plotSize: "50x100 ft",
      cashPrice: "800000",
      installmentPrice: "850000",
      status: "available",
      featured: false,
      shortDescription:
        "Build in one of Nairobi's expanding investment zones. Strategically located at Sunshine, next to Mama Ngina Children's Home, Joska presents an excellent opportunity for homebuyers and investors alike.",
      fullDescription:
        "Joska has become one of the most sought-after investment zones on Nairobi's eastern edge, and our development puts you right at its heart.\n\nStrategically located at Sunshine, next to Mama Ngina Children's Home, the project offers 50 × 100 plots with water and electricity available, full beaconing, and secure fencing.\n\nAs the neighbourhood continues to grow, Joska presents an excellent opportunity for homebuyers planning to build and investors positioning themselves for appreciation.",
      amenities: [
        "Water and electricity available",
        "Fully beaconed",
        "Securely fenced",
        "Growing neighbourhood",
      ],
      investmentHighlights: [
        "One of Nairobi's expanding investment zones",
        "Located at Sunshine, next to Mama Ngina Children's Home",
        "Ready for residential development",
      ],
      phasePricing: [],
      faqs: [],
    },
    {
      name: "EWAMA Mananja",
      slug: "ewama-mananja",
      county: "Machakos",
      location: "Mananja, Kasovelo Shopping Centre",
      plotSize: "50x100 ft",
      cashPrice: "300000",
      installmentPrice: "330000",
      status: "available",
      featured: false,
      shortDescription:
        "Affordable investment with great potential. Located at Kasovelo Shopping Centre, Mananja offers affordable plots within an emerging growth area — ideal for first-time buyers and seasoned investors.",
      fullDescription:
        "Mananja proves that a strong investment doesn't have to strain your budget.\n\nLocated at Kasovelo Shopping Centre, this development offers affordable 50 × 100 plots within an emerging growth area. Water and electricity are available, and every plot is clearly beaconed within a well-fenced development.\n\nWhether you're making your first land purchase or adding to an established portfolio, Mananja offers genuine value with room to grow.",
      amenities: [
        "Water available",
        "Electricity available",
        "Well fenced",
        "Clearly beaconed",
      ],
      investmentHighlights: [
        "Located at Kasovelo Shopping Centre",
        "Emerging growth area",
        "Ideal for first-time buyers",
      ],
      phasePricing: [
        { phase: "Phase II", cashPrice: 450000, installmentPrice: 460000 },
        { phase: "Phase III", cashPrice: 300000, installmentPrice: 330000 },
      ],
      faqs: [],
    },
    {
      name: "EWAMA Matuu",
      slug: "ewama-matuu",
      county: "Machakos",
      location: "Kivandini, Matuu",
      plotSize: "50x100 ft",
      cashPrice: "400000",
      installmentPrice: "450000",
      status: "available",
      featured: false,
      shortDescription:
        "Affordable land. Endless possibilities. Situated in Kivandini, Matuu offers an attractive opportunity for those looking to secure land in a growing region.",
      fullDescription:
        "Situated in Kivandini, our Matuu development offers an attractive opportunity for those looking to secure land in a growing region.\n\nThe project features 50 × 100 plots in a peaceful environment, well suited to residential development and long-term investment.\n\nWith its combination of affordability and potential, Matuu is a smart entry point into property ownership.",
      amenities: [
        "Peaceful environment",
        "Suitable for residential development",
      ],
      investmentHighlights: [
        "Situated in Kivandini, Matuu",
        "Growing region",
        "Excellent investment opportunity",
      ],
      phasePricing: [],
      faqs: [],
    },
    {
      name: "EWAMA Naivasha",
      slug: "ewama-naivasha",
      county: "Nakuru",
      location: "Mwiciringiri, past Kinungi",
      plotSize: "50x100 ft",
      cashPrice: "600000",
      installmentPrice: "650000",
      status: "available",
      featured: true,
      shortDescription:
        "Invest along Kenya's premier transport corridor. Located along the Nairobi–Nakuru Highway, past Kinungi at Mwiciringiri, this development benefits from strong connectivity and increasing demand.",
      fullDescription:
        "Few locations match the connectivity of the Nairobi–Nakuru Highway — Kenya's premier transport corridor.\n\nOur Naivasha development is located along the highway, past Kinungi at Mwiciringiri, giving owners effortless access while benefiting from steadily increasing demand in the region.\n\nThe project offers 50 × 100 plots, well fenced and well beaconed, with excellent long-term appreciation potential.",
      amenities: [
        "Well fenced",
        "Well beaconed",
      ],
      investmentHighlights: [
        "Along the Nairobi–Nakuru Highway",
        "Past Kinungi at Mwiciringiri",
        "Strong connectivity and increasing demand",
        "Excellent long-term appreciation potential",
      ],
      phasePricing: [],
      faqs: [],
    },
  ];

  let inserted = 0;
  let skipped = 0;
  for (const property of properties) {
    const existing = await db.select({ id: propertiesTable.id }).from(propertiesTable).where(eq(propertiesTable.slug, property.slug));
    if (existing.length > 0) {
      console.log(`- skipped (exists): ${property.name}`);
      skipped++;
      continue;
    }
    await db.insert(propertiesTable).values(property);
    console.log(`+ inserted property: ${property.name}`);
    inserted++;
  }

  // ─── Insights article: Why Invest in Real Estate? ───
  const articleSlug = "why-invest-in-real-estate";
  const existingArticle = await db.select({ id: articlesTable.id }).from(articlesTable).where(eq(articlesTable.slug, articleSlug));
  if (existingArticle.length > 0) {
    console.log("- skipped (exists): Why Invest in Real Estate?");
  } else {
    await db.insert(articlesTable).values({
      title: "Why Invest in Real Estate?",
      slug: articleSlug,
      category: "Investment Guide",
      author: "EWAMA Properties Ltd",
      status: "published",
      publishedAt: new Date(),
      readingTime: 6,
      excerpt:
        "Build wealth today. Secure tomorrow. Why land remains one of the most reliable ways to build and preserve wealth — and why Kenya's growth corridors present a rare opportunity.",
      content: `
<p><strong>Build Wealth Today. Secure Tomorrow.</strong></p>
<p>Real estate has long been recognised as one of the most reliable ways to build and preserve wealth. Unlike many investments that fluctuate with market conditions, land remains a tangible asset with the potential to appreciate over time, offering financial security and opportunities for future generations.</p>
<p>At EWAMA Properties Ltd, we believe that owning property is more than acquiring land — it's about creating a lasting legacy. Whether you're planning to build a home, expand your investment portfolio, or secure your family's future, real estate offers benefits that few other investments can match.</p>

<h2>A Tangible Asset You Can Trust</h2>
<p>Property is an investment you can see, visit, and develop. It offers a sense of security that many financial assets cannot provide. While markets may rise and fall, land continues to hold intrinsic value and remains one of the most dependable long-term investments.</p>

<h2>Long-Term Appreciation</h2>
<p>Strategically located land often increases in value as infrastructure improves, populations grow, and demand rises. Roads, schools, hospitals, commercial centres, and public utilities all contribute to making an area more desirable, increasing the value of nearby properties over time.</p>
<p>Investing early in emerging locations allows you to benefit from future appreciation while securing today's prices.</p>

<h2>Build Generational Wealth</h2>
<p>Property ownership creates opportunities that extend beyond a single lifetime. Land can be developed, leased, sold, or passed on to future generations, making it one of the most effective tools for preserving family wealth.</p>
<p>Owning property today means creating opportunities for tomorrow.</p>

<h2>Protection Against Inflation</h2>
<p>As the cost of living rises, property values often increase alongside inflation. This makes real estate an effective way to preserve purchasing power and protect your investments over the long term.</p>

<h2>Multiple Income Opportunities</h2>
<p>Real estate provides flexibility that many investments cannot offer. Depending on your goals, your property can generate value through:</p>
<ul>
<li>Residential development</li>
<li>Commercial projects</li>
<li>Rental income</li>
<li>Agricultural activities</li>
<li>Future resale</li>
<li>Land banking for appreciation</li>
</ul>
<p>One investment can create multiple streams of opportunity.</p>

<h2>Why Invest in Kenya?</h2>
<p>Kenya continues to experience rapid urbanisation, infrastructure development, and population growth, creating increasing demand for residential and commercial property. Government investments in highways, industrial parks, transport networks, and urban expansion continue to open new investment corridors across the country.</p>
<p>For investors, this presents opportunities to acquire strategically located property before demand reaches its peak.</p>

<h2>Is It the Right Time to Invest?</h2>
<p>One of the most common questions prospective buyers ask is, "Should I wait?"</p>
<p>History has consistently shown that land rarely becomes more affordable over time. As communities expand and infrastructure improves, demand increases — and so do property values.</p>
<p>The best time to invest was yesterday. The next best time is today.</p>
`.trim(),
    });
    console.log("+ inserted article: Why Invest in Real Estate?");
  }

  console.log(`\nDone. Properties inserted: ${inserted}, skipped: ${skipped}.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
