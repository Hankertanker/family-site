import { queryAll } from '@/lib/db';
import Button from '@/components/ui/button';
import { EmptyState } from '@/components/ui/States';
import type { Article } from '@/types';
import AdminBlogList from './AdminBlogList';

export default function AdminBlogPage() {
  const articles = queryAll<Article>('SELECT * FROM articles ORDER BY created_at DESC');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">博客管理</h1>
          <p className="text-sm text-stone-400 mt-0.5">共 {articles.length} 篇文章</p>
        </div>
        <Button href="/admin/blog/new">写新文章</Button>
      </div>

      {articles.length === 0 ? (
        <EmptyState message="还没有文章，写第一篇吧" icon="article" />
      ) : (
        <AdminBlogList articles={articles} />
      )}
    </div>
  );
}
