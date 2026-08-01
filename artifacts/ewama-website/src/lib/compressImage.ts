const MAX_DIMENSION = 1600; // cap the longest edge; plenty sharp for web, much smaller

/**
 * Shrink a large photo in the browser before upload: cap the longest edge at
 * 1920px and re-encode as WebP (~82% quality). This keeps stored images small
 * and fast to load even when the server can't run image optimisation. Non-image
 * files (PDF), and formats we shouldn't touch (SVG/GIF), pass through unchanged,
 * as does anything that wouldn't get smaller.
 */
export async function compressImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.8),
    );
    if (!blob || blob.size >= file.size) return file; // never upload something bigger

    const name = file.name.replace(/\.(jpe?g|png|webp)$/i, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file; // any failure: fall back to the original file
  }
}
