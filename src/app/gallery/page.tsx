import { queryAll } from '@/lib/db';
import AlbumCard from '@/components/gallery/AlbumCard';
import { EmptyState } from '@/components/ui/States';
import type { Album } from '@/types';

export default async function GalleryPage() {
  const albums = queryAll<Album>(
    `SELECT a.*,
      (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count,
      (SELECT 'uploads/gallery/' || filename FROM photos WHERE album_id = a.id ORDER BY sort_order LIMIT 1) as cover_url
     FROM albums a ORDER BY a.sort_order, a.created_at DESC`
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200">相册</h1>
        <p className="text-sm text-stone-400 mt-0.5">镜头定格的每一个瞬间</p>
      </div>

      {albums.length === 0 ? (
        <EmptyState message="还没有相册" icon="camera" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.map((album, i) => (
            <div
              key={album.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
