/**
 * Session-aware fetch wrapper.
 * Reads session token from window.__SESSION_TOKEN (set by AuthTokenInjector)
 * and sends it as a custom header with every request.
 */

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as Record<string, string>)['__SESSION_TOKEN'];
}

export function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getToken();

  if (!token) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers || {});
  headers.set('x-session-token', token);

  return fetch(input, { ...init, headers });
}
