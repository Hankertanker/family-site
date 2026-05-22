'use client';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Article } from '@/types';

export default function AdminBlogList({ articles: initialArticles }: { articles: Article[] }) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    await fetchWithAuth(`/api/articles/${deleteId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setArticles(articles.filter((a) => a.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-2">
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex items-center justify-between bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl p-4 hover:border-stone-200 dark:hover:border-stone-700 transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                  {article.title}
                </h3>
                {!article.published && (
                  <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full shrink-0">
                    草稿
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {new Date(article.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                {article.created_at !== article.updated_at && ' · 已编辑'}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <a
                href={`/admin/blog/${article.id}/edit`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                编辑
              </a>
              <a
                href={`/blog/${article.id}`}
                target="_blank"
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                查看
              </a>
              <button
                onClick={() => setDeleteId(article.id)}
                className="text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除文章"
        message="确认删除这篇文章吗？此操作不可撤销。"
        loading={deleting}
      />
    </>
  );
}
