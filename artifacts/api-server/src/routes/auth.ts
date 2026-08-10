import { Router } from "express";
import { z } from "zod";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "../services/supabase.js";
import { ensureAdminProfile, mapAdminUser } from "../services/adminUsers.js";
import { verifyLocalAdmin, setAdminPassword, createResetCode, verifyResetCode } from "../services/adminAuth.js";
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

  const email = body.data.email.trim().toLowerCase();
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
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  try {
    const adminUser = await ensureAdminProfile(data.user);

    res.json({
      user: mapAdminUser(adminUser),
      token: data.session.access_token,
    });
  } catch (err) {
    req.log.error({ err }, "Supabase user is not allowed to access CMS");
    const detail = err instanceof Error ? err.message : "Access denied";
    res.status(403).json({ error: "Access denied", detail });
  }
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
    const [row] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, payload.sub));
    if (row) {
      res.json(mapAdminUser(row));
      return;
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
  const email = req.userEmail?.trim().toLowerCase();
  if (!email) { res.status(401).json({ error: "Not authenticated" }); return; }

  const ok = await verifyLocalAdmin(email, body.data.currentPassword);
  if (!ok) { res.status(400).json({ error: "Your current password is incorrect" }); return; }

  await setAdminPassword(email, body.data.newPassword);
  res.json({ success: true });
});

// Step 1 of reset: email a verification code. Always responds success so it
// never reveals whether an email is registered.
router.post("/request-reset", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
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
  const email = body.data.email.trim().toLowerCase();
  const valid = await verifyResetCode(email, body.data.code.trim());
  if (!valid) { res.status(400).json({ error: "That code is invalid or has expired" }); return; }

  await setAdminPassword(email, body.data.newPassword);
  res.json({ success: true });
});

export { router as authRouter };
