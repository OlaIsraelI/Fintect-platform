import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createWalletsForExistingUsers() {
  try {
    // Find all users without wallets
    const users = await prisma.user.findMany({
      where: {
        wallet: null,
      },
    });

    console.log(`Found ${users.length} users without wallets`);

    let created = 0;
    for (const user of users) {
      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          accountNumber: Math.floor(
            1000000000 + Math.random() * 9000000000,
          ).toString(),
          currency: "NGN",
          status: "active",
        },
      });
      created++;
      console.log(
        `✅ Created wallet for ${user.email}: ${wallet.accountNumber}`,
      );
    }

    console.log(`✅ Created ${created} wallets`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createWalletsForExistingUsers();
