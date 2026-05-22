'use client';

import { useActionState } from 'react';
import { createAlbumAction } from './actions';
import Button from '@/components/ui/button';

export default function NewAlbumPage() {
  const [state, formAction, pending] = useActionState(createAlbumAction, null);

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">创建相册</h1>
        <p className="text-sm text-stone-400 mt-0.5">先建相册，再往里传照片</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            标题 *
          </label>
          <input
            type="text"
            name="title"
            className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400"
            placeholder="相册名称"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            描述
          </label>
          <input
            type="text"
            name="description"
            className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400"
            placeholder="可选描述"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button htmlType="submit" loading={pending}>
            创建
          </Button>
          <Button variant="ghost" href="/admin/gallery">
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
