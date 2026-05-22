import Link from 'next/link';
import type { Article } from '@/types';

const FALLBACK_BG_COLORS = [
  'bg-amber-100 dark:bg-amber-900/30',
  'bg-blue-100 dark:bg-blue-900/30',
  'bg-emerald-100 dark:bg-emerald-900/30',
  'bg-rose-100 dark:bg-rose-900/30',
  'bg-violet-100 dark:bg-violet-900/30',
  'bg-cyan-100 dark:bg-cyan-900/30',
];

const FALLBACK_ICONS = [
  <svg key="pen" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>,
  <svg key="heart" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>,
  <svg key="star" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>,
  <svg key="sun" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>,
];

export default function ArticleCard({ article }: { article: Article }) {
  const bgColor = FALLBACK_BG_COLORS[(article.id ?? 0) % FALLBACK_BG_COLORS.length];
  const icon = FALLBACK_ICONS[(article.id ?? 0) % FALLBACK_ICONS.length];

  return (
    <Link
      href={`/blog/${article.id}`}
      className="group block bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-md hover:border-stone-200 dark:hover:border-stone-700 transition-all duration-200"
    >
      <div className="aspect-[16/9] bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {article.cover_image ? (
          <img
            src={`/files/${article.cover_image}`}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${bgColor} text-stone-400 dark:text-stone-500`}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <time className="block text-xs text-stone-400 mt-3" dateTime={article.created_at}>
          {new Date(article.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </div>
    </Link>
  );
}
