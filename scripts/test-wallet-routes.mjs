import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const databaseUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

const normalizeDatabaseUrl = (value) => {
  try {
    const parsed = new URL(value);
    const sslMode = parsed.searchParams.get("sslmode");

    if (sslMode === "require" && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }

    return parsed.toString();
  } catch {
    return value;
  }
};

const requiresSsl =
  /sslmode=(require|verify-ca|verify-full)/i.test(databaseUrl || "") ||
  process.env.PGSSLMODE === "require";

const connectionString = normalizeDatabaseUrl(databaseUrl);

const pool = new Pool({
  connectionString,
  ssl: requiresSsl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const baseUrl = process.env.APP_URL || "http://localhost:3000";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function unique(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function request(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Cookie = `token=${token}`;
  }

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
}

async function seedUsers() {
  const senderEmail = `${unique("sender")}@example.com`;
  const receiverEmail = `${unique("receiver")}@example.com`;
  const password = "Passw0rd!234";
  const passwordHash = await bcrypt.hash(password, 10);

  const sender = await prisma.user.create({
    data: {
      email: senderEmail,
      phone: `${Math.floor(8000000000 + Math.random() * 1999999999)}`,
      firstName: "Sender",
      lastName: "Test",
      passwordHash,
      isEmailVerified: true,
      wallet: {
        create: {
          balance: 10000,
          accountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        },
      },
    },
    include: { wallet: true },
  });

  const receiver = await prisma.user.create({
    data: {
      email: receiverEmail,
      phone: `${Math.floor(8000000000 + Math.random() * 1999999999)}`,
      firstName: "Receiver",
      lastName: "Test",
      passwordHash,
      isEmailVerified: true,
      wallet: {
        create: {
          balance: 5000,
          accountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        },
      },
    },
    include: { wallet: true },
  });

  return { sender, receiver, password };
}

async function run() {
  console.log("Running wallet API flow tests...");

  const { sender, receiver, password } = await seedUsers();

  const loginResponse = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: sender.email, password }),
  });

  const loginData = await loginResponse.json();
  assert(loginResponse.ok, `Login failed: ${JSON.stringify(loginData)}`);
  const token = loginData.token;
  assert(token, "Login response did not include token");

  const balanceResponse = await request(
    "/api/wallet/balance",
    { method: "GET" },
    token,
  );
  const balanceData = await balanceResponse.json();
  assert(
    balanceResponse.ok,
    `Balance endpoint failed: ${JSON.stringify(balanceData)}`,
  );
  assert(Number(balanceData.balance) === 10000, "Unexpected starting balance");

  const transferAmount = 1000;
  const transferResponse = await request(
    "/api/wallet/transfer",
    {
      method: "POST",
      body: JSON.stringify({
        receiverAccountNumber: receiver.wallet.accountNumber,
        amount: transferAmount,
        description: "Integration transfer",
      }),
    },
    token,
  );

  const transferData = await transferResponse.json();
  assert(
    transferResponse.ok,
    `Transfer failed: ${JSON.stringify(transferData)}`,
  );
  const expectedAfterTransfer = 10000 - transferAmount - 10;
  assert(
    Number(transferData.data.newBalance) === expectedAfterTransfer,
    "Transfer balance update mismatch",
  );

  const withdrawAmount = 250;
  const withdrawResponse = await request(
    "/api/wallet/withdraw",
    {
      method: "POST",
      body: JSON.stringify({
        amount: withdrawAmount,
        description: "Integration withdrawal",
      }),
    },
    token,
  );

  const withdrawData = await withdrawResponse.json();
  assert(
    withdrawResponse.ok,
    `Withdraw failed: ${JSON.stringify(withdrawData)}`,
  );
  const expectedAfterWithdraw = expectedAfterTransfer - withdrawAmount;
  assert(
    Number(withdrawData.data.newBalance) === expectedAfterWithdraw,
    "Withdrawal balance update mismatch",
  );

  const transactionsResponse = await request(
    "/api/wallet/transactions",
    { method: "GET" },
    token,
  );
  const transactionsData = await transactionsResponse.json();
  assert(
    transactionsResponse.ok,
    `Transactions endpoint failed: ${JSON.stringify(transactionsData)}`,
  );

  const types = (transactionsData.transactions || []).map((tx) => tx.type);
  assert(types.includes("transfer"), "Transactions did not include transfer");
  assert(
    types.includes("withdrawal"),
    "Transactions did not include withdrawal",
  );

  console.log("All wallet API flow tests passed.");
  console.log(`Sender: ${sender.email}`);
  console.log(`Receiver: ${receiver.email}`);
}

run()
  .catch((error) => {
    console.error("Wallet API flow tests failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
