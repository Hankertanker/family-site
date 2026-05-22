import { createList, createInsert } from '@/lib/api-helpers';

export const GET = createList({
  table: 'footprints',
  orderBy: 'visit_date DESC',
});

export const POST = createInsert({
  table: 'footprints',
  fields: ['title', 'description', 'latitude', 'longitude', 'visit_date', 'color'],
  requiredFields: ['title', 'latitude', 'longitude'],
  defaults: { color: '#3B82F6' },
  responseKey: 'footprint',
});
