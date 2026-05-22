import { createUpdate, createDelete } from '@/lib/api-helpers';

export const PUT = createUpdate({
  table: 'chores',
  fields: ['title', 'assignee', 'due_date', 'done'],
  isPartial: true,
  responseKey: 'chore',
});

export const DELETE = createDelete({ table: 'chores' });
