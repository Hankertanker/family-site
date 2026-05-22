import { queryOne, queryAll } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GalleryAlbumClient from './GalleryAlbumClient';
import type { Album, Photo } from '@/types';

const PAGE_SIZE = 24;

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;

  const album = queryOne<Album>(
    `SELECT a.*,
      (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count,
      (SELECT 'uploads/gallery/' || filename FROM photos WHERE album_id = a.id ORDER BY sort_order LIMIT 1) as cover_url
     FROM albums a WHERE a.id = ?`,
    [albumId]
  );

  if (!album) notFound();

  const totalPhotos = album.photo_count || 0;

  // Only load first page server-side
  const photos = queryAll<Photo>(
    "SELECT *, ('uploads/gallery/' || filename) as url FROM photos WHERE album_id = ? ORDER BY sort_order, created_at DESC LIMIT ?",
    [albumId, PAGE_SIZE]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/gallery"
        className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 mb-4 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回相册
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200">
          {album.title}
        </h1>
        {album.description && (
          <p className="text-stone-500 text-sm mt-1">{album.description}</p>
        )}
      </div>

      <GalleryAlbumClient
        albumId={parseInt(albumId)}
        initialPhotos={photos}
        totalPhotos={totalPhotos}
      />
    </div>
  );
}
