# EWAMA Properties Ltd — Website & CMS

A production-ready website and lightweight CMS for EWAMA Properties Ltd, a Kenyan real estate company. Tagline: "Foundation of Trust."

## What This Is

- **Public Website**: Responsive property listing site with homepage, property pages, blog, contact, site visit booking, legal pages, newsletter signup
- **Admin CMS**: Full content management portal — properties, articles, enquiries, site visits, media, settings
- **Express API**: All data flows through a typed Express backend; the frontend never touches the database directly

## Admin Login

- URL: `/admin/login`
- Admin users are created manually in Supabase Auth (there is no public registration).
- Access can be restricted with the `ADMIN_EMAIL_ALLOWLIST` env var (comma-separated emails).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/ewama-website run dev` — run the frontend (port 5173, proxies /api to the API)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, wouter (router), TanStack Query, react-hook-form
- **Backend**: Express 5, Node.js, TypeScript, Drizzle ORM, multer (media uploads)
- **Database**: Supabase PostgreSQL (connection via `DATABASE_URL`)
- **Auth**: Supabase Auth — the API logs admins in via `signInWithPassword` and returns the Supabase access token; the frontend sends it as a Bearer token
- **Storage**: Supabase Storage — media uploads go to the `media` bucket (override with `SUPABASE_MEDIA_BUCKET`)
- **API codegen**: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)

## Brand

- Primary Gold: #D89B16
- Primary Green: #1F4A3B
- Charcoal: #2F2F2F
- Background: #FAFAF8
- Fonts: Poppins (headings), Inter (body)

## Where Things Live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle DB schema (properties, articles, enquiries, siteVisits, media, settings, adminUsers, activity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/ewama-website/src/` — React frontend + CMS

## Architecture Decisions

- Frontend → Express API → Drizzle → Supabase PostgreSQL. Frontend never touches DB directly.
- Supabase credentials (service role key) live only in the backend.
- Supabase access token stored in localStorage; passed as Bearer token in Authorization header.
- Admin routes protected by `requireAuth` middleware (Supabase token verification + admin profile check).
- Public routes (property listing, enquiry submission, site visit booking, newsletter) are unauthenticated.
- Media uploads: `POST /api/media/upload` (multipart) → Supabase Storage → public URL stored in `media` table. 10 MB limit; images and PDFs only.
- All JSON array fields (gallery, amenities, etc.) stored as JSONB in PostgreSQL.
- Prices stored as numeric strings in DB, converted to floats in API responses.

## Property Catalog (Seed Data)

| Property | Cash | Installment |
|---|---|---|
| Naivasha | Ksh 600,000 | Ksh 650,000 |
| Matuu | Ksh 400,000 | Ksh 450,000 |
| Sagana Ph 1 | Ksh 850,000 | Ksh 895,000 |
| Sagana Ph 2 | Ksh 900,000 | Ksh 950,000 |
| Mananja Ph 2 | Ksh 450,000 | Ksh 480,000 |
| Mananja Ph 3 | Ksh 300,000 | Ksh 330,000 |
| Gilgil | Ksh 500,000 | Ksh 550,000 |
| Joska | Ksh 750,000 | Ksh 800,000 |
| Imbirikani 50x100 | Ksh 180,000 | Ksh 200,000 |
| Imbirikani 100x100 | Ksh 330,000 | Ksh 350,000 |
| Imbirikani 1 Acre | Ksh 950,000 | Ksh 1,000,000 |

## Gotchas

- After OpenAPI spec changes, always run `pnpm --filter @workspace/api-spec run codegen` before building
- `req.params` access in Express 5 + TypeScript requires `req.params.id as string` cast to avoid `string | string[]` type error
- Properties use numeric strings for prices in Drizzle schema; always parse with `parseFloat()` in route handlers
- The homepage testimonials section contains placeholder quotes — replace with real, permissioned client testimonials before launch
- `lib/api-zod` needs `"lib": ["dom", "es2022"]` in its tsconfig because the generated multipart upload types reference `Blob`/`File`

## User Preferences

- Prices shown as "Ksh. 600,000" format (not KES)
- Admin UI should use plain English — no technical jargon visible to staff
- No emojis in UI
