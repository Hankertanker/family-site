import { createList, createInsert } from '@/lib/api-helpers';

export const GET = createList({
  table: 'chores',
  orderBy: 'done ASC, due_date ASC, created_at DESC',
});

export const POST = createInsert({
  table: 'chores',
  fields: ['title', 'assignee', 'due_date'],
  requiredFields: ['title'],
  defaults: { assignee: '' },
  responseKey: 'chore',
});
