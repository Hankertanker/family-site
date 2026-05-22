import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { queryOne, queryAll, run } from './db';

// --- Rate limiting ---

let lastSessionCleanup = 0;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getClientIp(): string {
  // In local LAN, use a placeholder. In production, read from headers.
  return 'local';
}

export function checkRateLimit(): { blocked: boolean; remaining: number } {
  const ip = getClientIp();

  // Clean old attempts
  run(
    `DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-${LOCKOUT_MINUTES} minutes')`
  );

  const recent = queryAll<{ count: number }>(
    `SELECT COUNT(*) as count FROM login_attempts WHERE ip = ? AND attempted_at > datetime('now', '-${LOCKOUT_MINUTES} minutes')`,
    [ip]
  );

  const count = recent[0]?.count ?? 0;
  return {
    blocked: count >= MAX_LOGIN_ATTEMPTS,
    remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - count),
  };
}

export function recordLoginAttempt() {
  const ip = getClientIp();
  run('INSERT INTO login_attempts (ip) VALUES (?)', [ip]);
}

export function clearLoginAttempts() {
  const ip = getClientIp();
  run('DELETE FROM login_attempts WHERE ip = ?', [ip]);
}

// --- Session management ---

export async function getSession(headerToken?: string | null) {
  let token: string | undefined;

  if (headerToken) {
    token = headerToken;
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('session')?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;

  const session = queryOne<{ id: string; created_at: string; expires_at: string }>(
    "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')",
    [token]
  );

  // Lazy cleanup of expired sessions (only every 5 minutes)
  if (Date.now() - lastSessionCleanup > 5 * 60 * 1000) {
    run("DELETE FROM sessions WHERE expires_at <= datetime('now')");
    lastSessionCleanup = Date.now();
  }

  return session ?? null;
}

export async function getSessionToken() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('session')?.value || null;
  } catch {
    return null;
  }
}

/** Read session from either cookie or custom header. */
export async function getSessionFromRequest(request: Request) {
  const headerToken = request.headers.get('x-session-token');
  return getSession(headerToken);
}

export async function requireAuth(request?: Request) {
  let session;
  if (request) {
    session = await getSessionFromRequest(request);
  } else {
    session = await getSession();
  }
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

/** Never throws — returns { session } on success or { unauthorized: NextResponse } on failure. */
export async function requireAuthSafe(): Promise<
  | { session: { id: string; created_at: string; expires_at: string } }
  | { unauthorized: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { unauthorized: NextResponse.json({ error: '请先登录' }, { status: 401 }) };
  }
  return { session };
}

export async function createSession(): Promise<string> {
  const token = crypto.randomUUID();
  run(
    "INSERT INTO sessions (id, expires_at) VALUES (?, datetime('now', '+7 days'))",
    [token]
  );
  return token;
}

export async function destroySession(token: string) {
  run('DELETE FROM sessions WHERE id = ?', [token]);
}

export async function destroyAllSessions() {
  run('DELETE FROM sessions');
}

// --- Password management ---

export async function isPasswordConfigured(): Promise<boolean> {
  const row = queryOne<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    ['password_hash']
  );
  return !!row;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const row = queryOne<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    ['password_hash']
  );
  if (!row) return false;
  return bcrypt.compare(password, row.value);
}

export async function setPassword(password: string) {
  const hash = await bcrypt.hash(password, 10);
  run(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    ['password_hash', hash]
  );
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
  const configured = await isPasswordConfigured();

  if (configured) {
    const valid = await verifyPassword(oldPassword);
    if (!valid) {
      return { error: '当前密码错误' };
    }
  }

  if (!newPassword || newPassword.length < 3) {
    return { error: '新密码至少3位' };
  }

  await setPassword(newPassword);
  return { ok: true };
}
