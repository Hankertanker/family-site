import { queryAll } from '@/lib/db';
import Button from '@/components/ui/button';

export default function AdminDashboard() {
  const articles = queryAll<{ count: number }>('SELECT COUNT(*) as count FROM articles');
  const albums = queryAll<{ count: number }>('SELECT COUNT(*) as count FROM albums');
  const photos = queryAll<{ count: number }>('SELECT COUNT(*) as count FROM photos');
  const events = queryAll<{ count: number }>('SELECT COUNT(*) as count FROM events');

  const stats = [
    { label: '文章', count: articles[0]?.count ?? 0, href: '/admin/blog', color: 'text-blue-600', icon: '📝' },
    { label: '相册', count: albums[0]?.count ?? 0, href: '/admin/gallery', color: 'text-emerald-600', icon: '📸' },
    { label: '照片', count: photos[0]?.count ?? 0, href: '/admin/gallery', color: 'text-amber-600', icon: '🖼️' },
    { label: '日程', count: events[0]?.count ?? 0, href: '/admin/calendar', color: 'text-rose-600', icon: '📅' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">管理员仪表盘</h1>
        <p className="text-sm text-stone-400 mt-0.5">网站内容一览</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 hover:shadow-md hover:border-stone-200 dark:hover:border-stone-700 transition-all duration-200 group"
          >
            <span className="text-xl mb-2 block">{s.icon}</span>
            <p className={`text-3xl font-bold ${s.color} tabular-nums`}>{s.count}</p>
            <p className="text-sm text-stone-400 mt-0.5">{s.label}</p>
          </a>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href="/admin/blog/new">写新文章</Button>
        <Button href="/admin/gallery/new" variant="secondary">创建相册</Button>
        <Button href="/admin/calendar" variant="secondary">添加日程</Button>
      </div>
    </div>
  );
}
