import { Router } from "express";
import { z } from "zod";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "../services/supabase.js";
import { ensureAdminProfile, mapAdminUser, assertAllowedAdminEmail } from "../services/adminUsers.js";
import {
  verifyLocalAdmin,
  verifySupabasePassword,
  setAdminPassword,
  createResetCode,
  verifyResetCode,
  normalizeEmail,
  isEnvAdminEmail,
  adminProfileOrFallback,
} from "../services/adminAuth.js";
import { signAdminToken, verifyAdminToken } from "../services/adminToken.js";
import { sendVerificationCode } from "../services/mailer.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const email = normalizeEmail(body.data.email);
  const password = body.data.password;

  // 1) Self-contained admin login — env master admin or a stored password
  //    hash. No Supabase Auth involved, so this always works once ADMIN_EMAIL
  //    and ADMIN_PASSWORD are set on the server.
  try {
    const localUser = await verifyLocalAdmin(email, password);
    if (localUser) {
      const token = signAdminToken({ sub: localUser.id, email: localUser.email, role: localUser.role });
      res.json({ user: mapAdminUser(localUser), token });
      return;
    }
  } catch (err) {
    req.log.error({ err }, "Local admin login failed");
  }

  // 2) Fallback: Supabase Auth (kept for existing Supabase-managed users).
  let data: Awaited<ReturnType<typeof supabaseAdmin.auth.signInWithPassword>>["data"] | null = null;
  try {
    const result = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (!result.error) data = result.data;
  } catch (err) {
    req.log.warn({ err }, "Supabase sign-in fallback unavailable");
  }

  if (!data?.session || !data.user) {
    // Say which part is wrong so the admin isn't left guessing. Only the
    // admin's own (public) email gets the password hint.
    const detail = isEnvAdminEmail(email)
      ? "This is the admin email, but the password doesn't match the one set on the server."
      : "This email is not set up as an EWAMA admin.";
    res.status(401).json({ error: "Incorrect email or password", detail });
    return;
  }

  try {
    assertAllowedAdminEmail(data.user.email ?? email);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Access denied";
    res.status(403).json({ error: "Access denied", detail });
    return;
  }

  // Issue our own session token so the rest of the dashboard works the same
  // way for every admin, even if the profile table can't be reached.
  let profile;
  try {
    profile = await ensureAdminProfile(data.user);
  } catch (err) {
    req.log.error({ err }, "Admin profile unavailable; continuing with a minimal profile");
    profile = await adminProfileOrFallback(normalizeEmail(data.user.email ?? email));
  }
  const token = signAdminToken({ sub: profile.id, email: profile.email, role: profile.role });
  res.json({ user: mapAdminUser(profile), token });
});

router.post("/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const token = authHeader.slice(7);

  // 1) Self-contained admin token
  const payload = verifyAdminToken(token);
  if (payload) {
    try {
      const [row] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, payload.sub));
      if (row) {
        res.json(mapAdminUser(row));
        return;
      }
    } catch (err) {
      req.log.error({ err }, "Admin profile lookup failed; answering from token");
    }
    res.json({
      id: payload.sub,
      email: payload.email,
      name: payload.email.split("@")[0] ?? "EWAMA Admin",
      role: payload.role,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    });
    return;
  }

  // 2) Fallback: Supabase token
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  try {
    const adminUser = await ensureAdminProfile(data.user);
    res.json(mapAdminUser(adminUser));
  } catch (err) {
    req.log.error({ err }, "Supabase user is not allowed to access CMS");
    const detail = err instanceof Error ? err.message : "Access denied";
    res.status(403).json({ error: "Access denied", detail });
  }
});

// ─── Self-service password management ───────────────────────────────

const changeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Change your own password while signed in.
router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  const body = changeSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const email = req.userEmail ? normalizeEmail(req.userEmail) : "";
  if (!email) { res.status(401).json({ error: "Not authenticated" }); return; }

  // The current password may be a self-set one, the env master password, or
  // (for older accounts) a Supabase Auth password.
  const ok =
    (await verifyLocalAdmin(email, body.data.currentPassword)) !== null ||
    (await verifySupabasePassword(email, body.data.currentPassword));
  if (!ok) { res.status(400).json({ error: "Your current password is incorrect" }); return; }

  try {
    await setAdminPassword(email, body.data.newPassword);
  } catch (err) {
    req.log.error({ err }, "Failed to save new admin password");
    res.status(500).json({ error: "Could not save the new password. Please try again." });
    return;
  }
  res.json({ success: true });
});

// Step 1 of reset: email a verification code. Always responds success so it
// never reveals whether an email is registered.
router.post("/request-reset", async (req, res) => {
  const email = normalizeEmail(String(req.body?.email ?? ""));
  if (email) {
    try {
      const code = await createResetCode(email);
      if (code) {
        const sent = await sendVerificationCode(email, code);
        if (!sent) req.log.warn("Reset code created but email is not configured (RESEND_API_KEY/RESEND_FROM)");
      }
    } catch (err) {
      req.log.error({ err }, "Failed to create/send reset code");
    }
  }
  res.json({ success: true });
});

const confirmSchema = z.object({
  email: z.string().min(1),
  code: z.string().min(4),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Step 2 of reset: verify the code and set the new password.
router.post("/confirm-reset", async (req, res) => {
  const body = confirmSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const email = normalizeEmail(body.data.email);
  try {
    const valid = await verifyResetCode(email, body.data.code.trim());
    if (!valid) { res.status(400).json({ error: "That code is invalid or has expired" }); return; }
    await setAdminPassword(email, body.data.newPassword);
  } catch (err) {
    req.log.error({ err }, "Password reset failed");
    res.status(500).json({ error: "Could not reset the password. Please try again." });
    return;
  }
  res.json({ success: true });
});

export { router as authRouter };
