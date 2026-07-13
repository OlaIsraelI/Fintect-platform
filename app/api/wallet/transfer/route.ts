import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverAccountNumber, amount, description } = body;

    if (!receiverAccountNumber) {
      return NextResponse.json(
        { error: "Receiver account number is required" },
        { status: 400 },
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    const { prisma } = await import("@/lib/prisma");

    // Get sender wallet
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: decoded.userId },
    });

    if (!senderWallet) {
      return NextResponse.json(
        { error: "Sender wallet not found" },
        { status: 404 },
      );
    }

    if (Number(senderWallet.balance) < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }

    // Get receiver wallet
    const receiverWallet = await prisma.wallet.findUnique({
      where: { accountNumber: receiverAccountNumber },
    });

    if (!receiverWallet) {
      return NextResponse.json(
        { error: "Receiver account not found" },
        { status: 404 },
      );
    }

    if (senderWallet.id === receiverWallet.id) {
      return NextResponse.json(
        { error: "Cannot transfer to yourself" },
        { status: 400 },
      );
    }

    // Generate reference
    const reference = `FT-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create transaction and update balances
    const result = await prisma.$transaction(async (tx: any) => {
      const updatedSender = await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      });

      const updatedReceiver = await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          reference,
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
          amount,
          fee: 0,
          type: "transfer",
          status: "completed",
          description: description || "Transfer",
          senderId: decoded.userId,
          receiverId: receiverWallet.userId,
          completedAt: new Date(),
        },
      });

      return { transaction, updatedSender };
    });

    return NextResponse.json({
      message: "Transfer successful",
      data: {
        transaction: result.transaction,
        newBalance: Number(result.updatedSender.balance),
      },
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Transfer failed" },
      { status: 500 },
    );
  }
}
