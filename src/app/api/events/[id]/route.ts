import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createItem } from '@/lib/api-helpers';
import type { Event } from '@/types';

export const GET = createItem({
  table: 'events',
  notFoundMessage: '日程不存在',
  responseKey: 'event',
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAuth(request); } catch {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  const { id } = await params;
  const { title, description, event_date, start_time, end_time, color, reminder_minutes, person } = await request.json();

  run(
    `UPDATE events
     SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?,
         color = ?, reminder_minutes = ?, reminder_sent = 0, person = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [title, description || null, event_date, start_time || null, end_time || null,
     color || '#3B82F6', reminder_minutes ?? 0, person || '', id]
  );

  const event = queryOne<Event>('SELECT * FROM events WHERE id = ?', [id]);
  return NextResponse.json({ event });
}

export const DELETE = (async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try { await requireAuth(request); } catch {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  const { id } = await params;
  run('DELETE FROM events WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}) satisfies typeof GET;
