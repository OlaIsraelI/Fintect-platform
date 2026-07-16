import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Find all users without wallets
    const usersWithoutWallets = await prisma.user.findMany({
      where: {
        wallet: null,
      },
    });

    console.log(`Found ${usersWithoutWallets.length} users without wallets`);

    let created = 0;
    for (const user of usersWithoutWallets) {
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
      console.log(`Created wallet for ${user.email}: ${wallet.accountNumber}`);
    }

    return NextResponse.json({
      message: `Created ${created} wallets`,
      created,
    });
  } catch (error) {
    console.error("Create wallets error:", error);
    return NextResponse.json(
      { error: "Failed to create wallets" },
      { status: 500 },
    );
  }
}
