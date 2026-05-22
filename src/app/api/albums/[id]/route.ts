import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, run } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { deleteFile } from '@/lib/upload';
import type { Album, Photo } from '@/types';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const album = queryOne<Album>(
    `SELECT a.*,
      (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count,
      (SELECT 'uploads/gallery/' || filename FROM photos WHERE album_id = a.id ORDER BY sort_order LIMIT 1) as cover_url
     FROM albums a WHERE a.id = ?`,
    [id]
  );

  if (!album) {
    return NextResponse.json({ error: '相册不存在' }, { status: 404 });
  }

  const photos = queryAll<Photo>(
    'SELECT *, (\'uploads/gallery/\' || filename) as url FROM photos WHERE album_id = ? ORDER BY sort_order, created_at DESC',
    [id]
  );

  return NextResponse.json({ album, photos });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAuth(request); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const { id } = await params;
  const { title, description, cover_photo_id } = await request.json();

  run(
    `UPDATE albums SET title = ?, description = ?, cover_photo_id = ?, updated_at = datetime('now') WHERE id = ?`,
    [title, description || null, cover_photo_id || null, id]
  );

  const album = queryOne<Album>('SELECT * FROM albums WHERE id = ?', [id]);
  return NextResponse.json({ album });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAuth(request); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const { id } = await params;

  // Delete photo files
  const photos = queryAll<Photo>('SELECT * FROM photos WHERE album_id = ?', [id]);
  for (const photo of photos) {
    const filePath = path.join(process.cwd(), 'uploads', 'gallery', photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  run('DELETE FROM albums WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
