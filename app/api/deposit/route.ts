import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============ GET: Fetch all deposits for the current user ============
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const deposits = await prisma.deposit.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error("Get deposits error:", error);
    return NextResponse.json(
      { error: "Failed to get deposits" },
      { status: 500 },
    );
  }
}

// ============ POST: Create a new deposit ============
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

    // 🔍 Check if the user actually exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { amount, paymentMethod } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 },
      );
    }

    // Generate a unique reference
    const reference = `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the deposit
    const deposit = await prisma.deposit.create({
      data: {
        userId: decoded.userId,
        amount,
        reference,
        paymentMethod,
        status: "pending",
      },
    });

    return NextResponse.json({
      message: "Deposit created successfully",
      deposit,
    });
  } catch (error) {
    console.error("Create deposit error:", error);
    return NextResponse.json(
      { error: "Failed to create deposit" },
      { status: 500 },
    );
  }
}
