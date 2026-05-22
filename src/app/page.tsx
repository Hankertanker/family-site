import { queryAll } from '@/lib/db';
import { cachedQuery } from '@/lib/cache';
import Link from 'next/link';
import ArticleCard from '@/components/blog/ArticleCard';
import WeatherCard from '@/components/home/WeatherCard';
import type { Article, Event, Photo, Chore } from '@/types';

export default function HomePage() {
  const articles = cachedQuery('home:articles', () =>
    queryAll<Article>(
      'SELECT * FROM articles WHERE published = 1 ORDER BY created_at DESC LIMIT 3'
    )
  );
  const events = cachedQuery('home:events', () =>
    queryAll<Event>(
      "SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC LIMIT 5"
    )
  );
  const pendingChores = cachedQuery('home:chores', () =>
    queryAll<Chore>(
      "SELECT * FROM chores WHERE done = 0 ORDER BY due_date ASC LIMIT 8"
    )
  );
  const photos = cachedQuery('home:photos', () =>
    queryAll<Photo>(
      "SELECT *, ('uploads/gallery/' || filename) as url FROM photos ORDER BY created_at DESC LIMIT 6"
    )
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-transparent dark:from-blue-950/20 dark:via-blue-950/10 dark:to-transparent py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <div className="text-6xl sm:text-7xl mb-6 animate-float inline-block">🏠</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
            我们的家
          </h1>
          <p className="text-stone-400 dark:text-stone-500 text-lg max-w-md mx-auto leading-relaxed">
            记录和分享家庭的美好时光
          </p>
        </div>
        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Weather */}
        <section className="animate-fade-in max-w-md">
          <WeatherCard />
        </section>

        {/* Latest Articles */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
                最新博客
              </h2>
              <p className="text-sm text-stone-400 mt-0.5">家里的新鲜事</p>
            </div>
            <Link
              href="/blog"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              查看全部
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {articles.length === 0 ? (
            <p className="text-stone-300 text-sm py-12 text-center">还没有文章</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a, i) => (
                <div
                  key={a.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <ArticleCard article={a} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="animate-fade-in animate-fade-in-delay-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
                近期日程
              </h2>
              <p className="text-sm text-stone-400 mt-0.5">别忘了这些日子</p>
            </div>
            <Link
              href="/calendar"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              查看全部
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="text-stone-300 text-sm py-12 text-center">暂无日程</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl p-4 hover:shadow-sm transition-all duration-200"
                >
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-stone-800 dark:text-stone-200 truncate">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <p className="font-medium text-stone-500 dark:text-stone-400">
                      {new Date(event.event_date).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {event.start_time && (
                      <p className="text-stone-400 dark:text-stone-500 mt-0.5">
                        {event.start_time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Tasks */}
        <section className="animate-fade-in animate-fade-in-delay-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
                ✅ 待办任务
              </h2>
              <p className="text-sm text-stone-400 mt-0.5">
                {pendingChores.length > 0 ? `还有 ${pendingChores.length} 件事没做` : '全部完成 🎉'}
              </p>
            </div>
            <Link
              href="/chores"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              查看全部
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {pendingChores.length === 0 ? (
            <p className="text-stone-300 text-sm py-8 text-center">暂无待办任务</p>
          ) : (
            <div className="space-y-2">
              {pendingChores.map((chore) => (
                <div
                  key={chore.id}
                  className="flex items-center gap-3 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl px-4 py-3"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-stone-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                      {chore.title}
                    </p>
                  </div>
                  {chore.assignee && (
                    <span className="text-xs text-stone-400 shrink-0">👤 {chore.assignee}</span>
                  )}
                  {chore.due_date && (
                    <span className="text-xs text-stone-300 shrink-0">{chore.due_date}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Photos */}
        <section className="animate-fade-in animate-fade-in-delay-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
                近期照片
              </h2>
              <p className="text-sm text-stone-400 mt-0.5">镜头下的温暖瞬间</p>
            </div>
            <Link
              href="/gallery"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              查看全部
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {photos.length === 0 ? (
            <p className="text-stone-300 text-sm py-12 text-center">还没有照片</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {photos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/gallery/${photo.album_id}`}
                  className="aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 group"
                >
                  <img
                    src={`/files/${photo.url}`}
                    alt={photo.original_name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:opacity-90"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
