import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const MAX_WIDTH = 1920;
const THUMB_WIDTH = 400;
const JPEG_QUALITY = 80;

export async function saveAndOptimizeImage(
  buffer: Buffer,
  originalName: string,
  subdir: string
): Promise<{ filepath: string; thumbpath: string | null }> {
  const ext = path.extname(originalName).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(UPLOADS_DIR, subdir);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (isImage) {
    // Optimize: resize to max width, convert to JPEG
    const optimized = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(MAX_WIDTH, undefined, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    const optimizedName = filename.replace(/\.[^.]+$/, '.jpg');
    fs.writeFileSync(path.join(dir, optimizedName), optimized);

    // Generate thumbnail
    const thumb = await sharp(buffer)
      .rotate()
      .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer();

    const thumbName = `thumb_${optimizedName}`;
    fs.writeFileSync(path.join(dir, thumbName), thumb);

    return {
      filepath: `uploads/${subdir}/${optimizedName}`,
      thumbpath: `uploads/${subdir}/${thumbName}`,
    };
  }

  // Non-image: save as-is
  fs.writeFileSync(path.join(dir, filename), buffer);
  return {
    filepath: `uploads/${subdir}/${filename}`,
    thumbpath: null,
  };
}
