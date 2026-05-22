import { queryAll, queryOne } from '@/lib/db';
import ArticleCard from '@/components/blog/ArticleCard';
import Pagination from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/States';
import type { Article } from '@/types';

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1'));
  const limit = 6;
  const offset = (page - 1) * limit;

  const articles = queryAll<Article>(
    'SELECT * FROM articles WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const totalRow = queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM articles WHERE published = 1'
  );
  const total = totalRow?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200">博客</h1>
        <p className="text-sm text-stone-400 mt-0.5">家里的文字记录</p>
      </div>

      {articles.length === 0 ? (
        <EmptyState message="还没有文章" icon="article" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a, i) => (
              <div
                key={a.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
