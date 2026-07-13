import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { transferFunds } from "@/lib/transaction";

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

    const result = await transferFunds(
      decoded.userId,
      receiverAccountNumber,
      amount,
      description,
    );

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
