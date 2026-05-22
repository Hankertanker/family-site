import { createUpdate, createDelete } from '@/lib/api-helpers';

export const PUT = createUpdate({
  table: 'health_reminders',
  fields: ['title', 'description', 'reminder_date', 'person', 'done', 'reminder_minutes'],
  isPartial: true,
  responseKey: 'reminder',
});

export const DELETE = createDelete({ table: 'health_reminders' });
