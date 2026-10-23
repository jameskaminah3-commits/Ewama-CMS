// EWAMA database bridge — a Supabase Edge Function.
//
// Lets the API server reach Postgres over ordinary HTTPS (port 443) when its
// host's firewall blocks the Postgres ports (5432/6543). The API sends SQL +
// parameters here; this function runs them inside Supabase and returns rows.
//
// Security: only callers presenting the project's service_role key (which
// already grants full database access) are accepted. Optionally also set a
// DB_PROXY_SECRET secret and send it as the x-db-proxy-secret header.
//
// Deploy: Supabase Dashboard → Edge Functions → Deploy a new function →
// Via Editor → name it `db-proxy` → paste this file → Deploy.

import postgres from "npm:postgres@3.4.5";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, {
  prepare: false,
  max: 3,
  idle_timeout: 20,
  // Return date/time values as Postgres text, exactly like the API's own
  // driver does, so the ORM converts them the same way on the other side.
  types: {
    rawDateTime: {
      to: 25,
      from: [1082, 1083, 1114, 1184, 1186, 1266],
      serialize: (x: unknown) => String(x),
      parse: (x: string) => x,
    },
  },
});

function safeEqual(a: string, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authorized(req: Request): boolean {
  const secret = Deno.env.get("DB_PROXY_SECRET");
  if (secret) return safeEqual(req.headers.get("x-db-proxy-secret") ?? "", secret);
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const bearer = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const apikey = req.headers.get("apikey") ?? "";
  return safeEqual(bearer, serviceKey) || safeEqual(apikey, serviceKey);
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function errorOf(e: unknown) {
  const err = e as { message?: string; code?: string };
  return { error: err?.message ?? String(e), code: err?.code ?? "DB_ERROR" };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!authorized(req)) return json({ error: "Unauthorized: service key does not match", code: "UNAUTHORIZED" }, 401);

  let body: { sql?: string; params?: unknown[]; method?: string; batch?: string[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body", code: "BAD_REQUEST" }, 400);
  }

  // Several standalone statements (startup migrations), each independent.
  if (Array.isArray(body.batch)) {
    const results: { error?: string }[] = [];
    for (const statement of body.batch) {
      try {
        await sql.unsafe(statement);
        results.push({});
      } catch (e) {
        results.push({ error: errorOf(e).error });
      }
    }
    return json({ results });
  }

  if (typeof body.sql !== "string") return json({ error: "Missing sql", code: "BAD_REQUEST" }, 400);

  try {
    const query = sql.unsafe(body.sql, (body.params ?? []) as never[]);
    // "all" = rows as arrays (what the ORM maps by column position);
    // anything else = rows as objects.
    const rows = body.method === "all" || body.method === "values" ? await query.values() : await query;
    return json({ rows: Array.from(rows as unknown as unknown[]) });
  } catch (e) {
    return json(errorOf(e), 400);
  }
});
