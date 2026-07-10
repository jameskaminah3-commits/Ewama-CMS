import { Router } from "express";
import { db, newsletterTable } from "@workspace/db";

const router = Router();

router.post("/subscribe", async (req, res) => {
  const { email, name } = req.body;
  if (!email) { res.status(400).json({ error: "email is required" }); return; }
  await db.insert(newsletterTable).values({ email, name: name ?? null }).onConflictDoNothing();
  res.status(201).json({ success: true });
});

export { router as newsletterRouter };
