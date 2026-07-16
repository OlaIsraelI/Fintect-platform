import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ CORRECTED: params is a Promise, so we must await it
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ✅ Await the params to get the reference
    const { reference } = await params;

    const deposit = await prisma.deposit.findUnique({
      where: { reference },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Check ownership
    if (deposit.userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ deposit });
  } catch (error) {
    console.error("Get deposit error:", error);
    return NextResponse.json(
      { error: "Failed to get deposit" },
      { status: 500 },
    );
  }
}
