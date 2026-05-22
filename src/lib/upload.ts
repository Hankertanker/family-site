import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { saveAndOptimizeImage } from './image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function saveFile(file: File, subdir: string): string {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), 'uploads', subdir);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const buffer = Buffer.from(file as unknown as ArrayBuffer);
  fs.writeFileSync(path.join(uploadsDir, filename), new Uint8Array(buffer));

  return `uploads/${subdir}/${filename}`;
}

export function saveFileBuffer(buffer: Buffer, originalName: string, subdir: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), 'uploads', subdir);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `uploads/${subdir}/${filename}`;
}

export function deleteFile(relativePath: string): void {
  if (!relativePath) return;
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
