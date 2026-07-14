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

async function checkDatabase() {
  try {
    console.log("⏳ Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected!");

    // Check if User table exists
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists. Count: ${userCount}`);

    const walletCount = await prisma.wallet.count();
    console.log(`✅ Wallet table exists. Count: ${walletCount}`);

    console.log("✅ All tables are working!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
