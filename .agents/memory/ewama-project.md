---
name: EWAMA Properties Ltd
description: Key decisions and gotchas for the EWAMA Properties website + CMS build
---

## Brand
- Gold: #D89B16, Green: #1F4A3B, Charcoal: #2F2F2F, Background: #FAFAF8
- Fonts: Poppins (headings), Inter (body)

## Admin Credentials
- Email: admin@ewamaproperties.co.ke / Password: ewama2024!
- bcrypt hash stored in DB; JWT auth via Bearer tokens

## Auth Architecture
- `setAuthTokenGetter(() => localStorage.getItem('admin_token'))` called at module load in `src/lib/auth.tsx`
- This must be imported BEFORE any API hook runs, otherwise the /api/auth/me call fails
- Logout clears localStorage AND calls `queryClient.clear()` to purge cached protected data

## API Access Control
- Public: GET /properties, GET /properties/slug/:slug, GET /properties/featured, POST /enquiries, POST /site-visits, POST /newsletter/subscribe, GET /settings, GET /homepage
- Admin-only (requireAuth): GET/PATCH /enquiries, GET/PATCH /site-visits, all dashboard, all media, POST/PATCH/DELETE on properties/articles

## DB Gotchas
- Prices stored as `numeric` strings in Drizzle; always `parseFloat()` in route handlers
- Array fields (gallery, amenities, etc.) are JSONB; cast with `$type<string[]>()` in schema
- `homepageContentTable` stats fields use `integer`, NOT `serial` (was a bug to watch)

## Express Gotchas
- `req.params["id"]` returns `string | string[]` in TypeScript; must cast: `req.params["id"] as string`
- `zod/v4` import path doesn't work in api-server (use `zod` directly); only Drizzle schema files use `zod/v4`

**Why:** zod is a peer dep in the api-server, not bundled; the `/v4` subpath is unavailable at that package resolution level.

## Security
- JWT_SECRET defaults to a dev value when env is missing; should set real secret in production
- Enquiries and site-visits list endpoints require auth (PII exposure risk if left public)
