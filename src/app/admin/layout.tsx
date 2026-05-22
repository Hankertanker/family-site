import { getSession, getSessionToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const sessionToken = await getSessionToken();

  const navItems = [
    { href: '/admin', label: '仪表盘' },
    { href: '/admin/blog', label: '博客管理' },
    { href: '/admin/gallery', label: '相册管理' },
    { href: '/admin/calendar', label: '日程管理' },
    { href: '/admin/settings', label: '设置' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Admin nav tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-stone-100 dark:border-stone-800 pb-0 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 px-3 py-2.5 border-b-2 border-transparent hover:border-stone-300 dark:hover:border-stone-600 shrink-0 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {children}

      <script
        dangerouslySetInnerHTML={{
          __html: `window.__SESSION_TOKEN="${sessionToken || ''}";`,
        }}
      />
    </div>
  );
}
