import Link from 'next/link';
import type { Album } from '@/types';

const FALLBACK_COLORS = [
  'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20',
  'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20',
  'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20',
  'bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/20',
  'bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/20',
  'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/20',
];

export default function AlbumCard({ album }: { album: Album }) {
  const bgGrad = FALLBACK_COLORS[(album.id ?? 0) % FALLBACK_COLORS.length];

  return (
    <Link
      href={`/gallery/${album.id}`}
      className="group block bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-md hover:border-stone-200 dark:hover:border-stone-700 transition-all duration-200"
    >
      <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {album.cover_url ? (
          <img
            src={`/files/${album.cover_url}`}
            alt={album.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${bgGrad} text-stone-400 dark:text-stone-500`}
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
      <div className="p-3">
        <h3 className="font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {album.title}
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          {album.photo_count || 0} 张照片
        </p>
      </div>
    </Link>
  );
}
