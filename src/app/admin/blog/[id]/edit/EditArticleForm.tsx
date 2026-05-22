'use client';

import { updateArticleAction } from '../../new/actions';
import ArticleForm from '@/components/blog/ArticleForm';
import type { Article } from '@/types';

export default function EditArticleForm({ article }: { article: Article }) {
  const boundAction = (prev: { error?: string } | null, formData: FormData) =>
    updateArticleAction(article.id, prev, formData);

  return (
    <ArticleForm
      article={article}
      action={boundAction}
      submitLabel="保存修改"
    />
  );
}
