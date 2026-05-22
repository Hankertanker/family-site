import { NextResponse } from 'next/server';
import { getSession, isPasswordConfigured } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const configured = await isPasswordConfigured();
  return NextResponse.json({
    authenticated: !!session,
    setup_needed: !configured,
  });
}
