import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTransactionHistory } from "@/lib/transaction";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const history = await getTransactionHistory(decoded.userId, 1, 10);

    if (!history.transactions) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json({ transactions: history.transactions });
  } catch (error) {
    console.error("Transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
