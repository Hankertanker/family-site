'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import Button from '@/components/ui/button';

export default function LoginForm({ setupNeeded }: { setupNeeded: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 animate-float">🔑</div>
          <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
            {setupNeeded ? '设置家庭密码' : '登录'}
          </h1>
          <p className="text-sm text-stone-400 mt-1.5">
            {setupNeeded
              ? '首次使用，创建一个密码吧'
              : '欢迎回来'}
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              密码
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400"
              placeholder="请输入密码"
              required
              minLength={3}
              autoFocus
            />
          </div>

          {setupNeeded && (
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                确认密码
              </label>
              <input
                type="password"
                name="confirm"
                className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400"
                placeholder="请再次输入密码"
                required
                minLength={3}
              />
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 px-3 py-2.5 rounded-xl border border-red-100 dark:border-red-900/50 animate-fade-in">
              {state.error}
            </p>
          )}

          {state?.remaining !== undefined && state.remaining > 0 && state.remaining <= 3 && (
            <p className="text-xs text-stone-400 text-center">
              还剩 {state.remaining} 次机会
            </p>
          )}

          <Button htmlType="submit" loading={pending} className="w-full">
            {setupNeeded ? '创建密码' : '登录'}
          </Button>
        </form>
      </div>
    </div>
  );
}
