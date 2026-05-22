import type { Photo } from '@/types';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (index: number) => void;
  deletable?: boolean;
  onDelete?: (photoId: number) => void;
}

export default function PhotoGrid({
  photos,
  onPhotoClick,
  deletable,
  onDelete,
}: PhotoGridProps) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
      {photos.map((photo, index) => (
        <div key={photo.id} className="relative group aspect-square">
          <img
            src={`/files/${photo.url}`}
            alt={photo.caption || photo.original_name}
            loading="lazy"
            className="w-full h-full object-cover rounded-xl cursor-pointer transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg group-active:scale-[0.98]"
            onClick={() => onPhotoClick?.(index)}
          />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-all duration-200 cursor-pointer"
            onClick={() => onPhotoClick?.(index)}
          />

          {/* Delete button (admin) */}
          {deletable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(photo.id);
              }}
              className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm active:scale-90 z-10"
              title="删除"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Photo count indicator */}
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-[11px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
              #{index + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
