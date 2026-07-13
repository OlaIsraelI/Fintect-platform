import redis from "./redis";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60,
): Promise<RateLimitResult> {
  const key = `rate-limit:${identifier}`;
  const currentTime = Math.floor(Date.now() / 1000);
  const resetTime = currentTime + windowSeconds;

  try {
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - currentCount);

    return {
      success: currentCount <= limit,
      limit,
      remaining,
      reset: resetTime,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    return {
      success: true,
      limit,
      remaining: 1,
      reset: resetTime,
    };
  }
}

export async function rateLimitMiddleware(request: any) {
  const ip = request.ip || "anonymous";
  const path = request.nextUrl?.pathname || "";

  const skipPaths = ["/api/health", "/api/webhooks"];
  if (skipPaths.some((p) => path.startsWith(p))) {
    return null;
  }

  const result = await rateLimit(ip, 100, 60);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      },
    );
  }

  return null;
}
