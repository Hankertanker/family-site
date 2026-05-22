'use client';

import { useActionState, useState, useId } from 'react';
import Button from '@/components/ui/button';
import MarkdownRenderer from './MarkdownRenderer';
import MarkdownToolbar from './MarkdownToolbar';
import type { Article } from '@/types';

interface ArticleFormProps {
  article?: Article;
  action: (prev: { error?: string } | null, formData: FormData) => Promise<{ error?: string }>;
  submitLabel?: string;
}

export default function ArticleForm({ article, action, submitLabel = '发布文章' }: ArticleFormProps) {
  const id = useId();
  const textareaId = `article-content-${id}`;
  const isEdit = !!article;

  const [state, formAction, pending] = useActionState(action, null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState(article?.content ?? '');

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/50">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor={`${id}-title`} className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          标题 *
        </label>
        <input
          id={`${id}-title`}
          type="text"
          name="title"
          defaultValue={article?.title}
          className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400"
          placeholder="文章标题"
          required
        />
      </div>

      <div>
        <label htmlFor={`${id}-excerpt`} className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          摘要
        </label>
        <input
          id={`${id}-excerpt`}
          type="text"
          name="excerpt"
          defaultValue={article?.excerpt || ''}
          className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400"
          placeholder="留空将自动从正文截取"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          封面图
        </label>
        <input
          type="file"
          name="cover_image"
          accept="image/*"
          className="text-sm text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-sm file:bg-stone-100 dark:file:bg-stone-800 file:text-stone-700 dark:file:text-stone-300 hover:file:bg-stone-200 dark:hover:file:bg-stone-700 transition-colors cursor-pointer"
        />
        {isEdit && (
          <input type="hidden" name="existing_cover" value={article.cover_image || ''} />
        )}
        {isEdit && article.cover_image && (
          <img
            src={`/files/${article.cover_image}`}
            alt="封面"
            className="mt-2 w-48 h-28 object-cover rounded-xl border border-stone-200 dark:border-stone-700"
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={textareaId} className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            正文 * (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showPreview ? '✏️ 编辑' : '👁️ 预览'}
          </button>
        </div>
        {!showPreview && <MarkdownToolbar textareaId={textareaId} />}
        {showPreview ? (
          <div className="min-h-[300px] border border-stone-200 dark:border-stone-700 rounded-xl p-4 bg-white dark:bg-stone-900">
            <MarkdownRenderer content={previewContent} />
          </div>
        ) : (
          <textarea
            id={textareaId}
            name="content"
            defaultValue={article?.content}
            onChange={(e) => setPreviewContent(e.target.value)}
            className="w-full min-h-[400px] px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-mono bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400"
            placeholder="用 Markdown 写文章..."
            required
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            name="published"
            defaultChecked={isEdit ? article.published === 1 : true}
            className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-stone-700 dark:text-stone-300">发布</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button htmlType="submit" loading={pending}>
          {submitLabel}
        </Button>
        <Button variant="ghost" href="/admin/blog">
          取消
        </Button>
      </div>
    </form>
  );
}
