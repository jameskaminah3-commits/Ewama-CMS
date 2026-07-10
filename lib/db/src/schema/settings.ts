import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name"),
  slogan: text("slogan"),
  phone: text("phone"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  officeAddress: text("office_address"),
  businessHours: text("business_hours"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  footerText: text("footer_text"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const homepageContentTable = pgTable("homepage_content", {
  id: serial("id").primaryKey(),
  heroHeading: text("hero_heading"),
  heroSubheading: text("hero_subheading"),
  heroButtonText: text("hero_button_text"),
  heroButtonLink: text("hero_button_link"),
  heroImage: text("hero_image"),
  mission: text("mission"),
  vision: text("vision"),
  statsYearsInBusiness: integer("stats_years_in_business"),
  statsPropertiesSold: integer("stats_properties_sold"),
  statsHappyClients: integer("stats_happy_clients"),
  statsCountiesCovered: integer("stats_counties_covered"),
  communityImpact: text("community_impact"),
  footerCta: text("footer_cta"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;

export const insertHomepageContentSchema = createInsertSchema(homepageContentTable).omit({ id: true, updatedAt: true });
export type InsertHomepageContent = z.infer<typeof insertHomepageContentSchema>;
export type HomepageContent = typeof homepageContentTable.$inferSelect;
