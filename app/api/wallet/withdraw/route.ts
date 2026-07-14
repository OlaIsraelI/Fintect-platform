import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { withdrawFunds } from "@/lib/transaction";

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
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    const result = await withdrawFunds(decoded.userId, amount, description);

    return NextResponse.json({
      message: "Withdrawal successful",
      data: {
        transaction: result.transaction,
        newBalance: Number(result.updatedWallet.balance),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Withdrawal failed";
    console.error("Withdraw error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
