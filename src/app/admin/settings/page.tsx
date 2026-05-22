'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 3) {
      setMessage({ type: 'error', text: '新密码至少 3 位' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次密码输入不一致' });
      return;
    }

    setSaving(true);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSaving(false);

    if (data.error) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setMessage({ type: 'success', text: data.needs_relogin ? '密码已修改，请重新登录' : '密码修改成功' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (data.needs_relogin) {
        setTimeout(() => router.push('/login'), 1500);
      }
    }
  }

  const inputBase =
    'w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400';

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">网站设置</h1>
        <p className="text-sm text-stone-400 mt-0.5">管理密码等网站配置</p>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 mb-4">
          修改密码
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              当前密码
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputBase}
              placeholder="输入当前密码"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputBase}
              placeholder="至少 3 位字符"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              确认新密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputBase}
              placeholder="再次输入新密码"
              required
              minLength={3}
            />
          </div>

          {message && (
            <div
              className={`text-sm px-4 py-2.5 rounded-xl border animate-fade-in ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                  : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
              }`}
            >
              {message.text}
            </div>
          )}

          <Button htmlType="submit" loading={saving}>
            修改密码
          </Button>
        </form>
      </div>
    </div>
  );
}
