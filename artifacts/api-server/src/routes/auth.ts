import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../services/supabase.js";
import { ensureAdminProfile, mapAdminUser } from "../services/adminUsers.js";

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

  const { email, password } = body.data;
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
    // Surface the real reason so admin sign-in problems are diagnosable from
    // the browser Network tab instead of a bare "Access denied".
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
    // Surface the real reason so admin sign-in problems are diagnosable from
    // the browser Network tab instead of a bare "Access denied".
    const detail = err instanceof Error ? err.message : "Access denied";
    res.status(403).json({ error: "Access denied", detail });
  }
});

export { router as authRouter };
