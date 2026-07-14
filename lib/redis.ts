import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const hasHostConfig = Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT);

const isHostedProduction =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

function isLocalRedisTarget(value: string): boolean {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return /localhost|127\.0\.0\.1|::1/i.test(value);
  }
}

const redis = redisUrl
  ? isHostedProduction && isLocalRedisTarget(redisUrl)
    ? null
    : new Redis(redisUrl, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        retryStrategy: (times) => Math.min(times * 50, 500),
      })
  : hasHostConfig
    ? isHostedProduction &&
      [process.env.REDIS_HOST, ""].includes(process.env.REDIS_HOST || "")
      ? null
      : new Redis({
          host: process.env.REDIS_HOST!,
          port: parseInt(process.env.REDIS_PORT!, 10),
          password: process.env.REDIS_PASSWORD || undefined,
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          connectTimeout: 3000,
          retryStrategy: (times) => Math.min(times * 50, 500),
        })
    : null;

if (redis) {
  redis.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redis.on("error", (error) => {
    console.error("Redis connection error:", error);
  });
}

export default redis;
