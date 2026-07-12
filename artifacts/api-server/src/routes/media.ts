import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import crypto from "node:crypto";
import path from "node:path";
import { db, mediaTable } from "@workspace/db";
import { eq, ilike, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { supabaseAdmin } from "../services/supabase.js";

const router = Router();

const MEDIA_BUCKET = process.env["SUPABASE_MEDIA_BUCKET"] || "media";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

let bucketReady = false;
async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  const { data } = await supabaseAdmin.storage.getBucket(MEDIA_BUCKET);
  if (!data) {
    const { error } = await supabaseAdmin.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_UPLOAD_BYTES,
    });
    // Another instance may have created it between the check and the create.
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  bucketReady = true;
}

function storagePathFor(fileName: string, forcedExt?: string): string {
  const ext = forcedExt ?? path.extname(fileName).toLowerCase().slice(0, 10);
  const base = path
    .basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "file";
  return `${new Date().toISOString().slice(0, 10)}/${base}-${crypto.randomBytes(4).toString("hex")}${ext}`;
}

// Formats sharp can safely re-encode. GIFs (animation) and SVGs pass through untouched.
const OPTIMIZABLE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff", "image/heic", "image/heif"]);
const MAX_DIMENSION = 1920; // display size cap; large camera photos shrink to this
const THUMB_WIDTH = 480;

interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  ext: string;
  thumbnail: Buffer | null;
}

/**
 * Re-encode uploads as WebP: auto-rotate from EXIF, strip metadata, cap the
 * longest edge at MAX_DIMENSION, and produce a small thumbnail for grids.
 * Falls back to the original bytes if the image can't be decoded.
 */
async function optimizeImage(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
  if (!OPTIMIZABLE_MIMES.has(mimeType)) {
    return { buffer, mimeType, ext: "", thumbnail: null };
  }
  try {
    const main = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const thumbnail = await sharp(buffer)
      .rotate()
      .resize({ width: THUMB_WIDTH, height: THUMB_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();
    // Keep whichever is smaller — tiny images can occasionally grow when re-encoded.
    if (main.length >= buffer.length) {
      return { buffer, mimeType, ext: "", thumbnail };
    }
    return { buffer: main, mimeType: "image/webp", ext: ".webp", thumbnail };
  } catch {
    return { buffer, mimeType, ext: "", thumbnail: null };
  }
}

function mapMedia(m: typeof mediaTable.$inferSelect) {
  return { ...m, createdAt: m.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const { search, page = "1", limit = "24" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  const where = search ? ilike(mediaTable.fileName, `%${search}%`) : undefined;
  const [data, [{ count }]] = await Promise.all([
    db.select().from(mediaTable).where(where).orderBy(desc(mediaTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(mediaTable).where(where),
  ]);
  res.json({ data: data.map(mapMedia), total: count, page: pageNum, limit: limitNum });
});

// POST /media/upload — multipart file upload to Supabase Storage
router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "A file is required (multipart field name: file)" });
    return;
  }
  if (!ALLOWED_MIME_PREFIXES.some((p) => file.mimetype.startsWith(p))) {
    res.status(400).json({ error: "Only images and PDF documents can be uploaded" });
    return;
  }

  await ensureBucket();
  const optimized = await optimizeImage(file.buffer, file.mimetype);
  const storagePath = storagePathFor(file.originalname, optimized.ext || undefined);
  const { error: uploadError } = await supabaseAdmin.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, optimized.buffer, {
      contentType: optimized.mimeType,
      cacheControl: "31536000",
    });
  if (uploadError) {
    req.log.error({ err: uploadError }, "Supabase Storage upload failed");
    res.status(502).json({ error: "File storage upload failed" });
    return;
  }

  let thumbnailUrl: string | null = null;
  if (optimized.thumbnail) {
    const thumbPath = `thumbs/${storagePath}`;
    const { error: thumbError } = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .upload(thumbPath, optimized.thumbnail, { contentType: "image/webp", cacheControl: "31536000" });
    if (thumbError) {
      req.log.warn({ err: thumbError }, "Thumbnail upload failed; continuing without one");
    } else {
      thumbnailUrl = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(thumbPath).data.publicUrl;
    }
  }

  const { data: publicUrl } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  const altText = typeof req.body?.altText === "string" && req.body.altText ? req.body.altText : file.originalname;
  const [media] = await db.insert(mediaTable).values({
    fileName: file.originalname,
    url: publicUrl.publicUrl,
    mimeType: optimized.mimeType,
    size: optimized.buffer.length,
    thumbnailUrl,
    altText,
  }).returning();
  res.status(201).json(mapMedia(media!));
});

router.post("/", requireAuth, async (req, res) => {
  const { fileName, url, mimeType, size, thumbnailUrl, altText } = req.body;
  if (!fileName || !url || !mimeType || size === undefined) {
    res.status(400).json({ error: "fileName, url, mimeType, size are required" });
    return;
  }
  const [media] = await db.insert(mediaTable).values({ fileName, url, mimeType, size, thumbnailUrl: thumbnailUrl ?? null, altText: altText ?? null }).returning();
  res.status(201).json(mapMedia(media!));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string, 10);
  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, id));
  if (media) {
    // Best-effort removal of the backing storage objects for files we host.
    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const toRemove: string[] = [];
    for (const url of [media.url, media.thumbnailUrl]) {
      const idx = url?.indexOf(marker) ?? -1;
      if (url && idx !== -1) toRemove.push(decodeURIComponent(url.slice(idx + marker.length)));
    }
    if (toRemove.length > 0) {
      const { error } = await supabaseAdmin.storage.from(MEDIA_BUCKET).remove(toRemove);
      if (error) req.log.warn({ err: error }, "Failed to remove storage objects for deleted media");
    }
  }
  await db.delete(mediaTable).where(eq(mediaTable.id, id));
  res.status(204).send();
});

export { router as mediaRouter };
