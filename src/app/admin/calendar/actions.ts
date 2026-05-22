'use server';

import { requireAuth } from '@/lib/auth';
import { run, queryOne } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function saveEventAction(prevState: { error?: string } | null, formData: FormData) {
  try { await requireAuth(); } catch { return { error: '请先登录' }; }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const eventDate = formData.get('event_date') as string;
  const description = formData.get('description') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  const color = formData.get('color') as string;
  const isAllDay = formData.get('all_day') === '1';

  if (!title || !eventDate) return { error: '标题和日期为必填项' };

  if (id) {
    run(
      `UPDATE events SET title=?, description=?, event_date=?, start_time=?, end_time=?, color=?, updated_at=datetime('now') WHERE id=?`,
      [title, description || null, eventDate, isAllDay ? null : startTime || null, isAllDay ? null : endTime || null, color || '#3B82F6', id]
    );
  } else {
    run(
      `INSERT INTO events (title, description, event_date, start_time, end_time, color) VALUES (?,?,?,?,?,?)`,
      [title, description || null, eventDate, isAllDay ? null : startTime || null, isAllDay ? null : endTime || null, color || '#3B82F6']
    );
  }

  revalidatePath('/admin/calendar');
  return { success: true };
}

export async function deleteEventAction(eventId: string) {
  try { await requireAuth(); } catch { return { error: '请先登录' }; }
  run('DELETE FROM events WHERE id = ?', [eventId]);
  revalidatePath('/admin/calendar');
  return { success: true };
}
