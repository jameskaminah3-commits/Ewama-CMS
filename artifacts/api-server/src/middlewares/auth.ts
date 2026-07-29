import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../services/supabase.js";
import { ensureAdminProfile } from "../services/adminUsers.js";
import { verifyAdminToken } from "../services/adminToken.js";

export interface AuthRequest extends Request {
  userId?: number;
  supabaseUserId?: string;
  userEmail?: string;
  userRole?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);

  // 1) Self-contained admin token — verified locally, no Supabase call.
  const payload = verifyAdminToken(token);
  if (payload) {
    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    next();
    return;
  }

  // 2) Fallback: Supabase access token.
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const adminUser = await ensureAdminProfile(data.user);
    req.userId = adminUser.id;
    req.supabaseUserId = data.user.id;
    req.userEmail = adminUser.email;
    req.userRole = adminUser.role;
    next();
  } catch (err) {
    req.log.error({ err }, "Authentication failed");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
