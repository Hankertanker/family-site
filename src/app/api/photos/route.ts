import { NextRequest, NextResponse } from 'next/server';
import { queryAll, run } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { saveAndOptimizeImage } from '@/lib/image';
import type { Photo } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const albumId = searchParams.get('album_id');
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '24');

  if (!albumId) {
    return NextResponse.json({ error: '缺少 album_id 参数' }, { status: 400 });
  }

  const photos = queryAll<Photo>(
    "SELECT *, ('uploads/gallery/' || filename) as url FROM photos WHERE album_id = ? ORDER BY sort_order, created_at DESC LIMIT ? OFFSET ?",
    [albumId, limit, offset]
  );

  return NextResponse.json({ photos });
}

export async function POST(request: NextRequest) {
  try { await requireAuth(request); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }

  const formData = await request.formData();
  const albumId = parseInt(formData.get('album_id') as string);
  const files = formData.getAll('files') as File[];

  if (!albumId || files.length === 0) {
    return NextResponse.json({ error: '缺少相册ID或照片' }, { status: 400 });
  }

  const photos: Photo[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { filepath } = await saveAndOptimizeImage(buffer, file.name, 'gallery');

    const filename = filepath.split('/').pop()!;
    const result = run(
      'INSERT INTO photos (album_id, filename, original_name) VALUES (?, ?, ?)',
      [albumId, filename, file.name]
    );

    photos.push({
      id: Number(result.lastInsertRowid),
      album_id: albumId,
      filename,
      original_name: file.name,
      caption: null,
      url: `uploads/gallery/${filename}`,
      created_at: new Date().toISOString(),
    });
  }

  // Update album's cover_photo_id if it doesn't have one
  const albumHasCover = queryAll<{ cover_photo_id: number | null }>(
    'SELECT cover_photo_id FROM albums WHERE id = ?',
    [albumId]
  );
  if (albumHasCover[0] && albumHasCover[0].cover_photo_id === null && photos.length > 0) {
    run('UPDATE albums SET cover_photo_id = ? WHERE id = ?', [photos[0].id, albumId]);
  }

  return NextResponse.json({ photos }, { status: 201 });
}
