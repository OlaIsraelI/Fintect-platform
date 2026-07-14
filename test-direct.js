import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function test() {
  try {
    console.log("⏳ Connecting...");
    await prisma.$connect();
    console.log("✅ Connected!");
    const count = await prisma.user.count();
    console.log(`✅ Users: ${count}`);
  } catch (error) {
    console.error("❌", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
