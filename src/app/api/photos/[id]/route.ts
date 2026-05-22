import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { deleteFile } from '@/lib/upload';
import type { Photo } from '@/types';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAuth(request); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const { id } = await params;

  const photo = queryOne<Photo>('SELECT * FROM photos WHERE id = ?', [id]);
  if (!photo) {
    return NextResponse.json({ error: '照片不存在' }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'uploads', 'gallery', photo.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  run('UPDATE albums SET cover_photo_id = NULL WHERE cover_photo_id = ?', [id]);
  run('DELETE FROM photos WHERE id = ?', [id]);

  return NextResponse.json({ success: true });
}
