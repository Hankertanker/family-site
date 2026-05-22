import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, run } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { saveFileBuffer, deleteFile } from '@/lib/upload';
import type { Article } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '6')));
  const offset = (page - 1) * limit;

  const articles = queryAll<Article>(
    `SELECT * FROM articles WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const totalRow = queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM articles WHERE published = 1'
  );
  const total = totalRow?.count ?? 0;

  return NextResponse.json({
    articles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try { await requireAuth(request); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = (formData.get('excerpt') as string) || content?.slice(0, 150) || '';
  const published = formData.get('published') === '0' ? 0 : 1;
  const coverFile = formData.get('cover_image') as File | null;

  if (!title || !content) {
    return NextResponse.json({ error: '标题和内容为必填项' }, { status: 400 });
  }

  let coverImage: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    coverImage = saveFileBuffer(buffer, coverFile.name, 'articles');
  }

  const result = run(
    `INSERT INTO articles (title, content, excerpt, cover_image, published) VALUES (?, ?, ?, ?, ?)`,
    [title, content, excerpt, coverImage, published]
  );

  const article = queryOne<Article>('SELECT * FROM articles WHERE id = ?', [result.lastInsertRowid]);
  return NextResponse.json({ article }, { status: 201 });
}
