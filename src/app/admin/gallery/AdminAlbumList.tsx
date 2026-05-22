'use client';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Album } from '@/types';

const FALLBACK_COLORS = [
  'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20',
  'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20',
  'from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20',
  'from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/20',
];

export default function AdminAlbumList({ albums: initialAlbums }: { albums: Album[] }) {
  const router = useRouter();
  const [albums, setAlbums] = useState(initialAlbums);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    await fetchWithAuth(`/api/albums/${deleteId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setAlbums(albums.filter((a) => a.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album, i) => (
          <div
            key={album.id}
            className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-md hover:border-stone-200 dark:hover:border-stone-700 transition-all"
          >
            <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-800 overflow-hidden">
              {album.cover_url ? (
                <img
                  src={`/files/${album.cover_url}`}
                  alt={album.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${FALLBACK_COLORS[i % FALLBACK_COLORS.length]} text-stone-400 dark:text-stone-500`}
                >
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-stone-900 dark:text-stone-100">{album.title}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{album.photo_count} 张照片</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/gallery/${album.id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  管理
                </Link>
                <button
                  onClick={() => setDeleteId(album.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除相册"
        message="确认删除这个相册吗？相册中的所有照片都会被删除。此操作不可撤销。"
        loading={deleting}
      />
    </>
  );
}
