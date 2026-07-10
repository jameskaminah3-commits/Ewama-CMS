import { pgTable, serial, text, boolean, numeric, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertyStatusEnum = pgEnum("property_status", [
  "draft",
  "available",
  "coming_soon",
  "sold_out",
  "archived",
]);

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  county: text("county").notNull(),
  location: text("location").notNull(),
  googleMapsLink: text("google_maps_link"),
  coordinates: text("coordinates"),
  heroImage: text("hero_image"),
  gallery: jsonb("gallery").$type<string[]>().default([]),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  plotSize: text("plot_size"),
  cashPrice: numeric("cash_price", { precision: 14, scale: 2 }).notNull(),
  installmentPrice: numeric("installment_price", { precision: 14, scale: 2 }).notNull(),
  titleDeedFee: numeric("title_deed_fee", { precision: 14, scale: 2 }),
  availablePhases: jsonb("available_phases").$type<string[]>().default([]),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  investmentHighlights: jsonb("investment_highlights").$type<string[]>().default([]),
  nearbyLandmarks: jsonb("nearby_landmarks").$type<string[]>().default([]),
  status: propertyStatusEnum("status").default("draft").notNull(),
  featured: boolean("featured").default(false).notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
