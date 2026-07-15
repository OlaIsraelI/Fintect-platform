import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import crypto from "crypto";

// Handle GET requests (redirect to the reset password page)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login?error=missing_token`,
    );
  }

  // Redirect to the reset password page with the token
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`,
  );
}

// Handle POST requests (process the password reset)
export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        verificationTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    // FIXED: Removed passwordChangedAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    const newToken = generateToken(user.id);

    return NextResponse.json({
      message: "Password reset successful",
      token: newToken,
      data: {
        user: { id: user.id, email: user.email, firstName: user.firstName },
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
