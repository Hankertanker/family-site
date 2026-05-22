'use client';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PhotoUploader from '@/components/gallery/PhotoUploader';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Spinner, EmptyState } from '@/components/ui/States';
import type { Album, Photo } from '@/types';

export default function AdminAlbumPhotosPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchWithAuth(`/api/albums/${albumId}`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('请求失败');
        return r.json();
      })
      .then((data) => {
        setAlbum(data.album ?? null);
        setPhotos(data.photos ?? []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setAlbum(null);
        setPhotos([]);
      });
  }, [albumId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    await fetchWithAuth(`/api/photos/${deleteId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setPhotos(photos.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  if (loading) return <Spinner />;

  if (!album) {
    return (
      <div className="text-center text-stone-400 py-12">相册不存在</div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/gallery"
        className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 mb-4 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回相册管理
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">{album.title}</h1>
        <p className="text-sm text-stone-400 mt-1">{photos.length} 张照片</p>
      </div>

      <div className="mb-8">
        <PhotoUploader albumId={parseInt(albumId)} onUploaded={loadData} />
      </div>

      {photos.length === 0 ? (
        <EmptyState message="还没有照片，拖拽或点击上传" icon="camera" />
      ) : (
        <PhotoGrid photos={photos} deletable onDelete={(id) => setDeleteId(id)} />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除照片"
        message="确认删除这张照片吗？此操作不可撤销。"
        loading={deleting}
      />
    </div>
  );
}
