export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col flex-1 w-full max-w-3xl items-center justify-center gap-8 py-32 px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
          Welcome to Our Family Site
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          A place to share memories, photos, and stories with the ones we love.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:w-auto"
            href="#"
          >
            Explore Gallery
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-black/10 px-6 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5 sm:w-auto"
            href="#"
          >
            Family Stories
          </a>
        </div>
      </main>
    </div>
  );
}
