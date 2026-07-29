import { Router } from "express";
import { z } from "zod";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "../services/supabase.js";
import { ensureAdminProfile, mapAdminUser } from "../services/adminUsers.js";
import { verifyLocalAdmin } from "../services/adminAuth.js";
import { signAdminToken, verifyAdminToken } from "../services/adminToken.js";

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

export { router as authRouter };
