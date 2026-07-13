import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

// Use a global variable to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaBetterSqlite3({ url: "./dev.db" });

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
