export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-stone-100 dark:border-stone-800 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm text-stone-400 dark:text-stone-500">
          &copy; {year} 我们的家
        </p>
        <p className="text-xs text-stone-300 dark:text-stone-600 mt-1 flex items-center justify-center gap-1">
          用 ❤️ 记录美好时光
        </p>
      </div>
    </footer>
  );
}
