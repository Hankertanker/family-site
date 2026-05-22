import { queryAll } from '@/lib/db';
import Button from '@/components/ui/button';
import { EmptyState } from '@/components/ui/States';
import type { Album } from '@/types';
import AdminAlbumList from './AdminAlbumList';

export default function AdminGalleryPage() {
  const albums = queryAll<Album>(
    `SELECT a.*,
      (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count,
      (SELECT 'uploads/gallery/' || filename FROM photos WHERE album_id = a.id ORDER BY sort_order LIMIT 1) as cover_url
     FROM albums a ORDER BY a.sort_order, a.created_at DESC`
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">相册管理</h1>
          <p className="text-sm text-stone-400 mt-0.5">共 {albums.length} 个相册</p>
        </div>
        <Button href="/admin/gallery/new">创建相册</Button>
      </div>

      {albums.length === 0 ? (
        <EmptyState message="还没有相册，创建一个吧" icon="camera" />
      ) : (
        <AdminAlbumList albums={albums} />
      )}
    </div>
  );
}
