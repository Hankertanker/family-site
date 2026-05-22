import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { saveFileBuffer, deleteFile } from '@/lib/upload';
import type { Article } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = queryOne<Article>('SELECT * FROM articles WHERE id = ? AND published = 1', [id]);

  if (!article) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAuth(request); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const { id } = await params;

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = (formData.get('excerpt') as string) || content?.slice(0, 150) || '';
  const published = formData.get('published') === '0' ? 0 : 1;
  const coverFile = formData.get('cover_image') as File | null;

  if (!title || !content) {
    return NextResponse.json({ error: '标题和内容为必填项' }, { status: 400 });
  }

  const existing = queryOne<Article>('SELECT * FROM articles WHERE id = ?', [id]);
  if (!existing) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  let coverImage = existing.cover_image;
  if (coverFile && coverFile.size > 0) {
    if (existing.cover_image) deleteFile(existing.cover_image);
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    coverImage = saveFileBuffer(buffer, coverFile.name, 'articles');
  }

  run(
    `UPDATE articles SET title = ?, content = ?, excerpt = ?, cover_image = ?, published = ?, updated_at = datetime('now') WHERE id = ?`,
    [title, content, excerpt, coverImage, published, id]
  );

  const article = queryOne<Article>('SELECT * FROM articles WHERE id = ?', [id]);
  return NextResponse.json({ article });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAuth(request); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const { id } = await params;

  const article = queryOne<Article>('SELECT * FROM articles WHERE id = ?', [id]);
  if (!article) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  if (article.cover_image) deleteFile(article.cover_image);
  run('DELETE FROM articles WHERE id = ?', [id]);

  return NextResponse.json({ success: true });
}
