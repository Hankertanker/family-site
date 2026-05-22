import type { Metadata } from 'next';
import './globals.css';
import { getSession, getSessionToken } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: '我们的家 — 家庭时光记录',
  description: '记录和分享家庭的美好时光',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const sessionToken = await getSessionToken();

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header authenticated={!!session} />
        <main className="flex-1 animate-page">{children}</main>
        <Footer />

        {/* Inject session token for client-side auth */}
        {sessionToken && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__SESSION_TOKEN="${sessionToken}";`,
            }}
          />
        )}
      </body>
    </html>
  );
}
