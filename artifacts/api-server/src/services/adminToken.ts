import crypto from "node:crypto";

/**
 * Self-contained admin session tokens (a minimal HS256 JWT), signed and
 * verified with Node's built-in crypto — no external dependency and no
 * reliance on Supabase Auth. Used by the local admin login path so the CMS
 * stays reachable even when Supabase Auth is misconfigured or unreachable.
 */

export interface AdminTokenPayload {
  sub: number; // admin_users.id
  email: string;
  role: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  return (
    process.env["ADMIN_JWT_SECRET"] ||
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    "ewama-insecure-dev-secret"
  );
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function signAdminToken(
  data: { sub: number; email: string; role: string },
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload: AdminTokenPayload = { ...data, iat: now, exp: now + ttlSeconds };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${header}.${payloadB64}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(signingInput).digest("base64url");
  return `${signingInput}.${sig}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payloadB64, sig] = parts;
  const signingInput = `${header}.${payloadB64}`;
  const expected = crypto.createHmac("sha256", getSecret()).update(signingInput).digest("base64url");

  const given = Buffer.from(sig ?? "");
  const want = Buffer.from(expected);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64 ?? "", "base64url").toString()) as AdminTokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
