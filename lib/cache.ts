import redis from "./redis";

const DEFAULT_TTL = 300; // 5 minutes

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (!redis || redis.status !== "ready") {
      return null;
    }
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL,
): Promise<void> {
  try {
    if (!redis || redis.status !== "ready") {
      return;
    }
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    if (!redis || redis.status !== "ready") {
      return;
    }
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    if (!redis || redis.status !== "ready") {
      return;
    }
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Cache pattern delete error:", error);
  }
}

export function generateCacheKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}
