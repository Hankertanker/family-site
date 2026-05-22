'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    const show = i === 1 || i === totalPages || Math.abs(i - page) <= 1;
    if (show) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1);
    }
  }

  const btnBase =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-3 text-sm rounded-xl transition-all duration-150 select-none';

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      {page > 1 && (
        <a
          href={`?page=${page - 1}`}
          className={`${btnBase} text-stone-600 hover:bg-stone-100 active:bg-stone-200`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
      )}

      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`e-${i}`} className="px-1 text-stone-300 select-none">
            ...
          </span>
        ) : (
          <a
            key={p}
            href={`?page=${p}`}
            className={`${btnBase} ${
              p === page
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 active:bg-stone-200'
            }`}
          >
            {p}
          </a>
        )
      )}

      {page < totalPages && (
        <a
          href={`?page=${page + 1}`}
          className={`${btnBase} text-stone-600 hover:bg-stone-100 active:bg-stone-200`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  );
}
