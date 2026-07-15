import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger.js";

/**
 * Idempotent, additive schema top-up run at server startup.
 *
 * Every statement uses `ADD COLUMN IF NOT EXISTS`, so this only ever adds
 * missing columns and never touches data or existing columns. It keeps the
 * database in step with the app even when `drizzle-kit push` was skipped or
 * failed (e.g. a dropped connection), so a schema gap can't take the site
 * down. Safe to run on every boot.
 */
const STATEMENTS: string[] = [
  // homepage_content — sections added over time
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_badge text`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS cta_heading text`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS cta_subheading text`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS advantages jsonb`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS process_steps jsonb`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS testimonials jsonb`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_slides jsonb`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS approach_text text`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS approach_quote text`,
  `ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS what_you_get jsonb`,
  // site_settings — extra socials
  `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tiktok text`,
  `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS youtube text`,
  // properties — per-project FAQs and phase pricing
  `ALTER TABLE properties ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb`,
  `ALTER TABLE properties ADD COLUMN IF NOT EXISTS phase_pricing jsonb DEFAULT '[]'::jsonb`,
  // media — optimised thumbnail URL
  `ALTER TABLE media ADD COLUMN IF NOT EXISTS thumbnail_url text`,
];

export async function autoMigrate(): Promise<void> {
  try {
    for (const statement of STATEMENTS) {
      await db.execute(sql.raw(statement));
    }
    logger.info("Schema auto-migration complete (all columns present)");
  } catch (err) {
    // Don't block startup — the routes degrade gracefully if something is off.
    logger.error({ err }, "Schema auto-migration failed; continuing anyway");
  }
}
