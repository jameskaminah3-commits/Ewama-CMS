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
// cPanel deployments can point a newly started app at an empty PostgreSQL
// database. Create the base schema first; the additive statements below then
// bring older installations up to the latest shape.
const BOOTSTRAP_STATEMENTS: string[] = [
  `DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('property', 'article', 'enquiry', 'site_visit', 'media');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    CREATE TYPE article_status AS ENUM ('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    CREATE TYPE enquiry_status AS ENUM ('unread', 'read', 'contacted', 'closed');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('draft', 'available', 'coming_soon', 'sold_out', 'archived');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    CREATE TYPE site_visit_status AS ENUM ('pending', 'approved', 'rejected', 'rescheduled', 'completed');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS admin_users (
    id serial PRIMARY KEY,
    supabase_user_id text UNIQUE,
    email text NOT NULL UNIQUE,
    password_hash text,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'admin',
    avatar_url text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS properties (
    id serial PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    county text NOT NULL,
    location text NOT NULL,
    google_maps_link text,
    coordinates text,
    hero_image text,
    gallery jsonb DEFAULT '[]'::jsonb,
    short_description text,
    full_description text,
    plot_size text,
    cash_price numeric(14, 2) NOT NULL,
    installment_price numeric(14, 2) NOT NULL,
    title_deed_fee numeric(14, 2),
    available_phases jsonb DEFAULT '[]'::jsonb,
    amenities jsonb DEFAULT '[]'::jsonb,
    investment_highlights jsonb DEFAULT '[]'::jsonb,
    nearby_landmarks jsonb DEFAULT '[]'::jsonb,
    faqs jsonb DEFAULT '[]'::jsonb,
    phase_pricing jsonb DEFAULT '[]'::jsonb,
    status property_status NOT NULL DEFAULT 'draft',
    featured boolean NOT NULL DEFAULT false,
    seo_title text,
    seo_description text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id serial PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    excerpt text,
    content text,
    featured_image text,
    category text,
    author text,
    status article_status NOT NULL DEFAULT 'draft',
    reading_time integer,
    seo_title text,
    seo_description text,
    published_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS enquiries (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    property_id integer,
    property_name text,
    message text NOT NULL,
    status enquiry_status NOT NULL DEFAULT 'unread',
    notes text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS site_visits (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    property_id integer,
    property_name text,
    preferred_date date NOT NULL,
    preferred_time text,
    status site_visit_status NOT NULL DEFAULT 'pending',
    admin_notes text,
    rescheduled_date date,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS media (
    id serial PRIMARY KEY,
    file_name text NOT NULL,
    url text NOT NULL,
    thumbnail_url text,
    mime_type text NOT NULL,
    size integer NOT NULL,
    alt_text text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS activity_log (
    id serial PRIMARY KEY,
    type activity_type NOT NULL,
    description text NOT NULL,
    entity_id integer,
    entity_title text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id serial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    name text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    id serial PRIMARY KEY,
    company_name text,
    slogan text,
    phone text,
    email text,
    whatsapp text,
    office_address text,
    business_hours text,
    facebook text,
    instagram text,
    linkedin text,
    tiktok text,
    youtube text,
    logo_url text,
    favicon_url text,
    footer_text text,
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS homepage_content (
    id serial PRIMARY KEY,
    hero_heading text,
    hero_subheading text,
    hero_button_text text,
    hero_button_link text,
    hero_image text,
    mission text,
    vision text,
    stats_years_in_business integer,
    stats_properties_sold integer,
    stats_happy_clients integer,
    stats_counties_covered integer,
    community_impact text,
    footer_cta text,
    hero_badge text,
    cta_heading text,
    cta_subheading text,
    advantages jsonb,
    process_steps jsonb,
    testimonials jsonb,
    hero_slides jsonb,
    approach_text text,
    approach_quote text,
    what_you_get jsonb,
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
];

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
    for (const statement of [...BOOTSTRAP_STATEMENTS, ...STATEMENTS]) {
      await db.execute(sql.raw(statement));
    }
    logger.info("Schema auto-migration complete (base tables and columns present)");
  } catch (err) {
    // Don't block startup — the routes degrade gracefully if something is off.
    logger.error({ err }, "Schema auto-migration failed; continuing anyway");
  }
}
