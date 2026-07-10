import { pgTable, serial, text, integer, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteVisitStatusEnum = pgEnum("site_visit_status", [
  "pending",
  "approved",
  "rejected",
  "rescheduled",
  "completed",
]);

export const siteVisitsTable = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  propertyId: integer("property_id"),
  propertyName: text("property_name"),
  preferredDate: date("preferred_date").notNull(),
  preferredTime: text("preferred_time"),
  status: siteVisitStatusEnum("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  rescheduledDate: date("rescheduled_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSiteVisitSchema = createInsertSchema(siteVisitsTable).omit({ id: true, createdAt: true });
export type InsertSiteVisit = z.infer<typeof insertSiteVisitSchema>;
export type SiteVisit = typeof siteVisitsTable.$inferSelect;
