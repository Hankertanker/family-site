import { createList, createInsert } from '@/lib/api-helpers';

export const GET = createList({
  table: 'growth_records',
  orderBy: 'record_date DESC',
});

export const POST = createInsert({
  table: 'growth_records',
  fields: ['record_date', 'height', 'weight', 'milestone', 'notes', 'photo_url'],
  requiredFields: ['record_date'],
  responseKey: 'record',
});
