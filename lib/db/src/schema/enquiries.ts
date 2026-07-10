import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const enquiryStatusEnum = pgEnum("enquiry_status", ["unread", "read", "contacted", "closed"]);

export const enquiriesTable = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  propertyId: integer("property_id"),
  propertyName: text("property_name"),
  message: text("message").notNull(),
  status: enquiryStatusEnum("status").default("unread").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEnquirySchema = createInsertSchema(enquiriesTable).omit({ id: true, createdAt: true });
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type Enquiry = typeof enquiriesTable.$inferSelect;
