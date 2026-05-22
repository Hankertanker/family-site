import { NextResponse } from 'next/server';
import { getSessionFromRequest, changePassword, destroyAllSessions, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  // Must be authenticated
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { currentPassword, newPassword } = body;

  const result = await changePassword(currentPassword || '', newPassword || '');
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Invalidate all sessions (log out everywhere) and create a new one
  destroyAllSessions();
  const token = await createSession();

  const response = NextResponse.json({ success: true, needs_relogin: true });
  response.cookies.set('session', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    secure: false,
  });
  return response;
}
