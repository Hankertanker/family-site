'use client';

import { createArticleAction } from './actions';
import ArticleForm from '@/components/blog/ArticleForm';

export default function NewArticlePage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">写新文章</h1>
        <p className="text-sm text-stone-400 mt-0.5">用 Markdown 记录家里的故事</p>
      </div>
      <ArticleForm action={createArticleAction} submitLabel="发布文章" />
    </div>
  );
}
