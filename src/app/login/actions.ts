'use server';

import {
  verifyPassword,
  createSession,
  isPasswordConfigured,
  setPassword,
  checkRateLimit,
  recordLoginAttempt,
  clearLoginAttempts,
} from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  prevState: { error?: string; remaining?: number } | null,
  formData: FormData
) {
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  // Rate limit check
  const rateCheck = checkRateLimit();
  if (rateCheck.blocked) {
    return {
      error: `登录尝试次数过多，请 ${15} 分钟后再试`,
      remaining: 0,
    };
  }

  if (!password || password.length < 3) {
    recordLoginAttempt();
    return { error: '密码至少3位', remaining: rateCheck.remaining - 1 };
  }

  const configured = await isPasswordConfigured();

  if (!configured) {
    // First-time setup
    if (password !== confirm) {
      return { error: '两次密码输入不一致' };
    }
    await setPassword(password);
  } else {
    const valid = await verifyPassword(password);
    if (!valid) {
      recordLoginAttempt();
      const remaining = rateCheck.remaining - 1;
      return {
        error: remaining > 0 ? `密码错误，还剩 ${remaining} 次机会` : '登录尝试次数过多，请稍后再试',
        remaining,
      };
    }
  }

  // Success — clear attempts
  clearLoginAttempts();

  const token = await createSession();
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    secure: false,
  });

  redirect('/admin');
}
