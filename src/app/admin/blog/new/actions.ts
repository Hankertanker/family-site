'use server';

import { requireAuth } from '@/lib/auth';
import { run, queryOne } from '@/lib/db';
import { saveAndOptimizeImage } from '@/lib/image';
import { redirect } from 'next/navigation';
import type { Article } from '@/types';

export async function createArticleAction(prevState: { error?: string } | null, formData: FormData) {
  try { await requireAuth(); } catch { return { error: '请先登录' }; }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = (formData.get('excerpt') as string) || content?.slice(0, 150) || '';
  const published = formData.get('published') === '0' ? 0 : 1;
  const coverFile = formData.get('cover_image') as File | null;

  if (!title || !content) return { error: '标题和内容为必填项' };

  let coverImage: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const result = await saveAndOptimizeImage(buffer, coverFile.name, 'articles'); coverImage = result.filepath;
  }

  run(`INSERT INTO articles (title, content, excerpt, cover_image, published) VALUES (?, ?, ?, ?, ?)`,
    [title, content, excerpt, coverImage, published]);

  redirect('/admin/blog');
}

export async function updateArticleAction(articleId: number, prevState: { error?: string } | null, formData: FormData) {
  try { await requireAuth(); } catch { return { error: '请先登录' }; }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = (formData.get('excerpt') as string) || content?.slice(0, 150) || '';
  const published = formData.get('published') === '0' ? 0 : 1;
  const coverFile = formData.get('cover_image') as File | null;

  if (!title || !content) return { error: '标题和内容为必填项' };

  let coverImage = formData.get('existing_cover') as string || null;
  if (coverFile && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const result = await saveAndOptimizeImage(buffer, coverFile.name, 'articles'); coverImage = result.filepath;
  }

  run(`UPDATE articles SET title=?, content=?, excerpt=?, cover_image=?, published=?, updated_at=datetime('now') WHERE id=?`,
    [title, content, excerpt, coverImage, published, articleId]);

  redirect('/admin/blog');
}
