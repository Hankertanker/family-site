'use client';

import { useState, useCallback, useMemo } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import { Spinner } from '@/components/ui/States';
import type { Photo } from '@/types';

const PAGE_SIZE = 24;

export default function GalleryAlbumClient({
  albumId,
  initialPhotos,
  totalPhotos,
}: {
  albumId: number;
  initialPhotos: Photo[];
  totalPhotos: number;
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPhotos.length < totalPhotos);
  const [error, setError] = useState('');

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError('');

    try {
      const offset = photos.length;
      const res = await fetch(
        `/api/photos?album_id=${albumId}&offset=${offset}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        setPhotos((prev) => [...prev, ...data.photos]);
        if (photos.length + data.photos.length >= totalPhotos) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      setError('加载失败，请重试');
    }
    setLoading(false);
  }, [albumId, loading, hasMore, photos.length, totalPhotos]);

  // Build slides for Lightbox
  const slides = useMemo(
    () =>
      photos.map((p) => ({
        src: `/files/${p.url}`,
        alt: p.caption || p.original_name,
        description: p.caption || undefined,
      })),
    [photos]
  );

  if (totalPhotos === 0) {
    return (
      <div className="text-center py-32">
        <div className="text-6xl mb-4 opacity-30">📷</div>
        <p className="text-stone-400">暂无照片</p>
      </div>
    );
  }

  return (
    <div>
      {/* Photo count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-400">
          共 <span className="font-medium text-stone-500">{totalPhotos}</span> 张
          {photos.length < totalPhotos && (
            <span className="text-stone-300">
              {' · '}已加载 <span className="text-stone-400">{photos.length}</span> 张
            </span>
          )}
        </p>
        <p className="text-xs text-stone-300">点击照片浏览</p>
      </div>

      {/* Photo grid */}
      <PhotoGrid
        photos={photos}
        onPhotoClick={(i) => {
          setLightboxIndex(i);
          setLightboxOpen(true);
        }}
      />

      {/* Load more */}
      {hasMore && (
        <div className="flex items-center justify-center mt-8 gap-4">
          <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-20" />
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 hover:border-stone-300 active:scale-[0.97] transition-all text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {loading
              ? '加载中...'
              : `加载更多（还剩 ${totalPhotos - photos.length} 张）`}
          </button>
          <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-20" />
        </div>
      )}

      {error && (
        <div className="text-center mt-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={loadMore}
            className="text-blue-600 text-sm mt-1 hover:underline"
          >
            重试
          </button>
        </div>
      )}

      {loading && <Spinner className="py-8" />}

      {/* Yet Another React Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        styles={{ container: { backgroundColor: 'rgba(0,0,0,.95)' } }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
