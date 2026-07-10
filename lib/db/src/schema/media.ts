import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mediaTable = pgTable("media", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  altText: text("alt_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMediaSchema = createInsertSchema(mediaTable).omit({ id: true, createdAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type MediaFile = typeof mediaTable.$inferSelect;
