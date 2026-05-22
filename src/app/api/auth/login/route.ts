import { NextResponse } from 'next/server';
import {
  verifyPassword,
  createSession,
  setPassword,
  isPasswordConfigured,
  checkRateLimit,
  recordLoginAttempt,
  clearLoginAttempts,
} from '@/lib/auth';

export async function POST(request: Request) {
  // Rate limit
  const rateCheck = checkRateLimit();
  if (rateCheck.blocked) {
    return NextResponse.json(
      { error: '登录尝试次数过多，请 15 分钟后再试' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { password, confirm } = body;

  if (!password || typeof password !== 'string' || password.length < 3) {
    recordLoginAttempt();
    return NextResponse.json(
      { error: rateCheck.remaining > 1 ? `请输入密码，还剩 ${rateCheck.remaining - 1} 次机会` : '请输入密码' },
      { status: 400 }
    );
  }

  const configured = await isPasswordConfigured();

  if (!configured) {
    // First-time setup
    if (!confirm || password !== confirm) {
      return NextResponse.json({ error: '两次密码输入不一致' }, { status: 400 });
    }
    await setPassword(password);
    const token = await createSession();
    clearLoginAttempts();

    const response = NextResponse.json({ success: true, setup: true });
    response.cookies.set('session', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      secure: false,
    });
    return response;
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    recordLoginAttempt();
    const remaining = rateCheck.remaining - 1;
    return NextResponse.json(
      {
        error:
          remaining > 0
            ? `密码错误，还剩 ${remaining} 次机会`
            : '登录尝试次数过多，请稍后再试',
      },
      { status: 401 }
    );
  }

  // Success
  clearLoginAttempts();
  const token = await createSession();

  const response = NextResponse.json({ success: true });
  response.cookies.set('session', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    secure: false,
  });
  return response;
}
