import { NextResponse } from 'next/server';
import { queryAll, run } from '@/lib/db';

export async function GET() {
  const reminders = queryAll<{
    id: number;
    title: string;
    description: string | null;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    reminder_minutes: number;
    person: string;
  }>(
    `SELECT id, title, description, event_date, start_time, end_time, reminder_minutes, person
     FROM events
     WHERE reminder_minutes > 0
       AND reminder_sent = 0
       AND datetime(event_date || 'T' || COALESCE(start_time, '00:00')) <= datetime('now', 'localtime', '+' || reminder_minutes || ' minutes')
       AND datetime(event_date || 'T' || COALESCE(start_time, '00:00')) > datetime('now', 'localtime')`,
    []
  );

  return NextResponse.json({ reminders, count: reminders.length });
}

/**
 * Mark one or more reminders as sent (called after notification delivered).
 */
export async function POST(request: Request) {
  const { ids } = await request.json().catch(() => ({ ids: [] as number[] }));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids required' }, { status: 400 });
  }

  const placeholders = ids.map(() => '?').join(',');
  run(
    `UPDATE events SET reminder_sent = 1 WHERE id IN (${placeholders})`,
    ids
  );

  return NextResponse.json({ success: true });
}
