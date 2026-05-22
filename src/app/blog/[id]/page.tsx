import { queryOne } from '@/lib/db';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Article } from '@/types';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = queryOne<Article>(
    'SELECT * FROM articles WHERE id = ? AND published = 1',
    [id]
  );

  if (!article) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/blog"
        className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 mb-6 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回博客
      </Link>

      {article.cover_image && (
        <div className="w-full max-h-96 overflow-hidden rounded-2xl mb-6 bg-stone-100 dark:bg-stone-800">
          <img
            src={`/files/${article.cover_image}`}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight leading-tight">
          {article.title}
        </h1>
        <time className="text-sm text-stone-400" dateTime={article.created_at}>
          {new Date(article.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>

      <div className="border-t border-stone-100 dark:border-stone-800 pt-8">
        <MarkdownRenderer content={article.content} />
      </div>
    </article>
  );
}
