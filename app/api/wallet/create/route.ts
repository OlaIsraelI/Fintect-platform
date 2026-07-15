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

    // Check if user already has a wallet
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId: decoded.userId },
    });

    if (existingWallet) {
      return NextResponse.json({
        message: "Wallet already exists",
        wallet: existingWallet,
      });
    }

    // Create wallet for user
    const wallet = await prisma.wallet.create({
      data: {
        userId: decoded.userId,
        balance: 0,
        accountNumber: Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString(),
        currency: "NGN",
        status: "active",
      },
    });

    return NextResponse.json({
      message: "Wallet created successfully",
      wallet,
    });
  } catch (error) {
    console.error("Create wallet error:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 },
    );
  }
}
