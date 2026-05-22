'use server';

import { requireAuth } from '@/lib/auth';
import { run } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function createAlbumAction(
  prevState: { error?: string } | null,
  formData: FormData
) {
  try {
    await requireAuth();
  } catch {
    return { error: '请先登录' };
  }

  const title = formData.get('title') as string;
  if (!title) {
    return { error: '请输入标题' };
  }

  const description = formData.get('description') as string;

  const result = run(
    'INSERT INTO albums (title, description) VALUES (?, ?)',
    [title, description || null]
  );

  redirect(`/admin/gallery/${result.lastInsertRowid}`);
}
