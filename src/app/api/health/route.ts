import { createList, createInsert } from '@/lib/api-helpers';

export const GET = createList({
  table: 'health_reminders',
  orderBy: 'done ASC, reminder_date ASC',
});

export const POST = createInsert({
  table: 'health_reminders',
  fields: ['title', 'description', 'reminder_date', 'person', 'reminder_minutes'],
  requiredFields: ['title', 'reminder_date'],
  defaults: { person: '虎仔', reminder_minutes: 1440 },
  responseKey: 'reminder',
});
