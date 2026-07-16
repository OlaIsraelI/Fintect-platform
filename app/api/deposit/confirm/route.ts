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

    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    // Confirm deposit and update wallet
    const deposit = await prisma.$transaction(async (tx) => {
      const dep = await tx.deposit.update({
        where: { reference },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { userId: dep.userId },
        data: {
          balance: {
            increment: dep.amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          reference: `DEP-${Date.now()}`,
          receiverWalletId: dep.userId,
          amount: dep.amount,
          fee: 0,
          type: "deposit",
          status: "completed",
          description: `Deposit via ${dep.paymentMethod}`,
          completedAt: new Date(),
          receiverId: dep.userId,
          depositId: dep.id,
        },
      });

      return dep;
    });

    return NextResponse.json({
      message: "Deposit confirmed successfully",
      deposit,
    });
  } catch (error) {
    console.error("Confirm deposit error:", error);
    return NextResponse.json(
      { error: "Failed to confirm deposit" },
      { status: 500 },
    );
  }
}
