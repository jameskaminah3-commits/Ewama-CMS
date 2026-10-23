import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzleProxy } from "drizzle-orm/pg-proxy";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Two ways to reach the database:
 *
 *   "pg"    — a normal Postgres connection (ports 5432/6543). Fastest.
 *   "https" — through the `db-proxy` Supabase Edge Function over ordinary
 *             HTTPS (port 443), for hosts whose firewall blocks Postgres
 *             ports. See supabase/functions/db-proxy.
 *
 * DB_TRANSPORT=pg|https forces one; otherwise initDatabase() tries "pg" and
 * falls back to "https" when the Postgres connection is refused.
 */
export type DbTransport = "pg" | "https";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fail fast instead of hanging forever when a firewall drops the packets.
  connectionTimeoutMillis: 10_000,
});
const pgDb = drizzlePg(pool, { schema });

function proxyUrl(): string | null {
  if (process.env.DB_PROXY_URL) return process.env.DB_PROXY_URL;
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  return base ? `${base}/functions/v1/db-proxy` : null;
}

class DbProxyError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "DbProxyError";
    this.code = code;
  }
}

async function callProxy(body: unknown): Promise<any> {
  const url = proxyUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DbProxyError("HTTPS database proxy is not configured", "PROXY_UNCONFIGURED");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
      ...(process.env.DB_PROXY_SECRET ? { "x-db-proxy-secret": process.env.DB_PROXY_SECRET } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const data = (await res.json().catch(() => null)) as { error?: string; code?: string; msg?: string } | null;
  if (!res.ok) {
    throw new DbProxyError(data?.error ?? data?.msg ?? `Database proxy returned HTTP ${res.status}`, data?.code ?? `HTTP_${res.status}`);
  }
  return data;
}

const proxyDb = drizzleProxy(
  async (sql, params, method) => {
    const data = await callProxy({ sql, params, method });
    return { rows: data.rows };
  },
  { schema },
);

let transport: DbTransport = process.env.DB_TRANSPORT === "https" ? "https" : "pg";
let transportNote = process.env.DB_TRANSPORT ? `forced by DB_TRANSPORT=${process.env.DB_TRANSPORT}` : "default";

export function getDbTransport(): { transport: DbTransport; note: string } {
  return { transport, note: transportNote };
}

/**
 * The app-wide database handle. It forwards to whichever transport is active,
 * so every route keeps using `db` unchanged.
 */
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const active = (transport === "https" ? proxyDb : pgDb) as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(active, prop, active);
    return typeof value === "function" ? value.bind(active) : value;
  },
});

function describe(err: unknown): string {
  const parts: string[] = [];
  let cur: unknown = err;
  while (cur instanceof Error) {
    const code = (cur as { code?: unknown }).code;
    parts.push(code !== undefined ? `[${String(code)}] ${cur.message}` : cur.message);
    cur = cur.cause;
  }
  return parts.join(" <- ") || String(err);
}

/** Pick the transport at startup (see DbTransport). Never throws. */
export async function initDatabase(): Promise<{ transport: DbTransport; note: string }> {
  if (process.env.DB_TRANSPORT === "pg" || process.env.DB_TRANSPORT === "https") {
    return getDbTransport();
  }

  try {
    await pool.query("select 1");
    transportNote = "direct Postgres connection";
    return getDbTransport();
  } catch (pgErr) {
    try {
      await callProxy({ sql: "select 1", params: [], method: "execute" });
      transport = "https";
      transportNote = `Postgres unreachable (${describe(pgErr)}); using HTTPS proxy`;
    } catch (proxyErr) {
      transportNote = `Postgres unreachable (${describe(pgErr)}); HTTPS proxy also failed (${describe(proxyErr)})`;
    }
    return getDbTransport();
  }
}

/**
 * Run several standalone SQL statements, each independently (one failing
 * doesn't stop the rest). Over HTTPS they go in a single request, so startup
 * migrations stay fast. Returns an error message per statement, or null.
 */
export async function executeStatements(statements: string[]): Promise<(string | null)[]> {
  if (transport === "https") {
    const data = await callProxy({ batch: statements });
    return (data.results as { error?: string }[]).map((r) => r.error ?? null);
  }
  const results: (string | null)[] = [];
  for (const statement of statements) {
    try {
      await pool.query(statement);
      results.push(null);
    } catch (err) {
      results.push(describe(err));
    }
  }
  return results;
}

export * from "./schema";
