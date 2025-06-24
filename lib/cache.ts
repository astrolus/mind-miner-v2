interface CacheEntry<T> {
  value: T;
  expiry: number; // Unix timestamp in milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, value: T, ttlSeconds: number): void {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiry });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.value as T;
  }
  // If expired or not found, remove it
  if (entry) {
    cache.delete(key);
  }
  return null;
}

export function clearCache(key: string): void {
  cache.delete(key);
}

export function clearAllCache(): void {
  cache.clear();
}