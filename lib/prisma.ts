import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Use a global variable to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

const resolvedDatabaseUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

const normalizeDatabaseUrl = (databaseUrl: string) => {
  try {
    const parsed = new URL(databaseUrl);
    const sslMode = parsed.searchParams.get("sslmode");

    if (sslMode === "require" && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }

    return parsed.toString();
  } catch {
    return databaseUrl;
  }
};

if (!resolvedDatabaseUrl) {
  throw new Error(
    "Missing database URL. Set POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL, or DATABASE_URL.",
  );
}

const requiresSsl =
  /sslmode=(require|verify-ca|verify-full)/i.test(resolvedDatabaseUrl) ||
  process.env.PGSSLMODE === "require";

const connectionString = normalizeDatabaseUrl(resolvedDatabaseUrl);

const pool = new Pool({
  connectionString,
  ssl: requiresSsl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

const adapter = new PrismaPg(pool);

const prismaOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  adapter,
};

export const prisma = global.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
