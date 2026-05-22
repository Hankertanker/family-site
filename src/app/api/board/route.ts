import { createList, createInsert } from '@/lib/api-helpers';

export const GET = createList({
  table: 'board_messages',
  orderBy: 'created_at DESC',
});

export const POST = createInsert({
  table: 'board_messages',
  fields: ['content', 'author'],
  requiredFields: ['content'],
  defaults: { author: '' },
  responseKey: 'message',
});
