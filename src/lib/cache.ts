// Thin in-memory cache for Server Component DB queries.
// Invalidates after TTL, suitable for low-traffic family sites.

const store = new Map<string, { data: unknown; expiresAt: number }>();

export function cachedQuery<T>(key: string, query: () => T, ttlMs: number = 60_000): T {
  const cached = store.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }
  const data = query();
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}
