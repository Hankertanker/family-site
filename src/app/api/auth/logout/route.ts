import { NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/auth';

export async function POST() {
  const session = await getSession();
  if (session) {
    await destroySession(session.id);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 0,
    secure: false,
  });
  return response;
}
