import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityTypeEnum = pgEnum("activity_type", [
  "property",
  "article",
  "enquiry",
  "site_visit",
  "media",
]);

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  description: text("description").notNull(),
  entityId: integer("entity_id"),
  entityTitle: text("entity_title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activityLogTable).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type ActivityLog = typeof activityLogTable.$inferSelect;
