import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { createInsert } from '@/lib/api-helpers';
import type { Event } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let sql = 'SELECT * FROM events';
  const params: string[] = [];

  if (start && end) {
    sql += ' WHERE event_date >= ? AND event_date <= ?';
    params.push(start, end);
  }
  sql += ' ORDER BY event_date ASC, start_time ASC';

  const events = queryAll<Event>(sql, params);
  return NextResponse.json({ events });
}

export const POST = createInsert({
  table: 'events',
  fields: ['title', 'description', 'event_date', 'start_time', 'end_time', 'color', 'reminder_minutes', 'person'],
  requiredFields: ['title', 'event_date'],
  defaults: { color: '#3B82F6', reminder_minutes: 0, person: '' },
  authRequired: true,
  responseKey: 'event',
});
