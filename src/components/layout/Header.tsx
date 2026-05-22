'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

export default function Header({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (!window.confirm('确认退出登录？')) return;
    await fetchWithAuth('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
    router.refresh();
  }

  const links = [
    { href: '/', label: '首页' },
    { href: '/blog', label: '博客' },
    { href: '/gallery', label: '相册' },
    { href: '/calendar', label: '日程' },
    { href: '/footprint', label: '足迹' },
        { href: '/board', label: '留言' },
        { href: '/chores', label: '任务' },
    { href: '/growth', label: '成长' },
    { href: '/health', label: '健康' },
  ];

  const navLinkClass = (href: string) =>
    `text-sm transition-colors duration-150 ${
      pathname === href
        ? 'text-blue-600 font-medium'
        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-lg border-b border-stone-100 dark:border-stone-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg text-stone-900 dark:text-stone-100 hover:opacity-80 transition-opacity"
          onClick={() => {
            const cb = document.getElementById(
              'mobile-menu-cb'
            ) as HTMLInputElement;
            if (cb) cb.checked = false;
          }}
        >
          🏠 我们的家
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass(l.href)}>
              {l.label}
            </Link>
          ))}
          {authenticated ? (
            <div className="flex items-center gap-3 pl-3 border-l border-stone-200 dark:border-stone-700">
              <Link
                href="/admin"
                className="text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
              >
                管理
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
              >
                设置
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            >
              登录
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <label
          htmlFor="mobile-menu-cb"
          className="sm:hidden p-3 -mr-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-500 active:bg-stone-100 dark:active:bg-stone-800 rounded-xl cursor-pointer select-none transition-colors"
          aria-label="菜单"
        >
          <svg
            className="w-6 h-6 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
        <input type="checkbox" id="mobile-menu-cb" className="hidden peer" />

        {/* Backdrop */}
        <div
          className="hidden peer-checked:block fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden transition-opacity duration-200"
          onClick={() => {
            const cb = document.getElementById(
              'mobile-menu-cb'
            ) as HTMLInputElement;
            if (cb) cb.checked = false;
          }}
        />

        {/* Mobile menu */}
        <div
          className="hidden peer-checked:block sm:hidden fixed top-14 right-0 w-64 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-2xl rounded-bl-2xl px-5 py-4 space-y-1 z-50 origin-top-right animate-fade-in"
          style={{ animationDuration: '0.2s' }}
        >
          {links.map((l, idx) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block text-sm py-2.5 px-2 rounded-lg transition-colors ${
                pathname === l.href
                  ? 'text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/50'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              } animate-fade-in`}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {l.label}
            </Link>
          ))}
          <hr className="my-2 border-stone-100 dark:border-stone-800" />
          {authenticated ? (
            <>
              <Link
                href="/admin"
                className="block text-sm py-2.5 px-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                ⚙️ 管理
              </Link>
              <Link
                href="/admin/settings"
                className="block text-sm py-2.5 px-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                🔒 设置
              </Link>
              <button
                onClick={handleLogout}
                className="block text-sm py-2.5 px-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 w-full text-left transition-colors"
              >
                退出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block text-sm py-2.5 px-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              🔑 登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
