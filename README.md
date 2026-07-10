# EWAMA Properties Ltd Website & CMS

Production-ready React/Vite website and Express CMS API for EWAMA Properties Ltd.

## Architecture

- `artifacts/ewama-website` - React, TypeScript, Vite, Tailwind CMS and public website.
- `artifacts/api-server` - Express API. The frontend only talks to this API.
- `lib/db` - Drizzle schema for Supabase PostgreSQL.
- `lib/api-client-react` and `lib/api-zod` - generated API client/types.

Database access flows through:

```text
React frontend -> Express API -> service/route layer -> Supabase PostgreSQL
```

Supabase credentials are used only by the backend.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` at the repo root.
3. Fill in:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL_ALLOWLIST`
4. In Supabase Auth, create the EWAMA administrator user manually. There is no public registration route.
5. Push the database schema:

```bash
corepack pnpm --filter @workspace/db push
```

The CMS tables are normal Supabase PostgreSQL tables. Admin login uses Supabase Auth, and the API creates or links an `admin_users` profile after a successful Supabase login.

## Local Development

Install dependencies:

```bash
corepack pnpm install
```

Build and typecheck everything:

```bash
corepack pnpm run build
```

Run the API:

```bash
corepack pnpm --filter @workspace/api-server dev
```

Run the website in another terminal:

```bash
corepack pnpm --filter @workspace/ewama-website dev
```

Default local URLs:

- API: `http://localhost:5000/api/health`
- Website: `http://localhost:5173`
- Admin: `http://localhost:5173/admin/login`

## Railway Notes

Deploy the API and website as separate services. Add the same backend environment variables to the API service. The frontend should continue calling the Express API and should never contain Supabase service keys.
