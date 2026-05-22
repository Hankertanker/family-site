import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="text-8xl mb-6 animate-float">🏠</div>
      <h1 className="text-6xl font-bold text-stone-200 dark:text-stone-700 mb-2">404</h1>
      <p className="text-stone-400 mb-8 text-lg">这个页面好像迷路了……</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm hover:shadow-md text-sm font-medium active:scale-[0.97]"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        回家
      </Link>
    </div>
  );
}
