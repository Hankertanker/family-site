import { queryOne } from '@/lib/db';
import { notFound } from 'next/navigation';
import EditArticleForm from './EditArticleForm';
import type { Article } from '@/types';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = queryOne<Article>('SELECT * FROM articles WHERE id = ?', [id]);
  if (!article) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">编辑文章</h1>
        <p className="text-sm text-stone-400 mt-0.5">修改后记得保存</p>
      </div>
      <EditArticleForm article={article} />
    </div>
  );
}
