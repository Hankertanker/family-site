import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { createInsert } from '@/lib/api-helpers';
import type { Album } from '@/types';

export async function GET() {
  const albums = queryAll<Album>(
    `SELECT a.*,
      (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count,
      (SELECT 'uploads/gallery/' || filename FROM photos WHERE album_id = a.id ORDER BY sort_order LIMIT 1) as cover_url
     FROM albums a ORDER BY a.sort_order, a.created_at DESC`
  );
  return NextResponse.json({ albums });
}

export const POST = createInsert({
  table: 'albums',
  fields: ['title', 'description'],
  requiredFields: ['title'],
  authRequired: true,
  responseKey: 'album',
});
