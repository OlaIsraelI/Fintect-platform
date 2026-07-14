import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const hasHostConfig = Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT);

const redis = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy: (times) => Math.min(times * 50, 500),
    })
  : hasHostConfig
    ? new Redis({
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
