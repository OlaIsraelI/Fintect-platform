import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const serializeWallet = (wallet: any) =>
  wallet
    ? {
        ...wallet,
        balance: Number(wallet.balance),
      }
    : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, firstName, lastName, password } = body;

    // Validate required fields
    if (!email || !phone || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user with wallet
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        verificationToken,
        verificationTokenExpires,
        wallet: {
          create: {
            balance: 0,
            accountNumber: Math.floor(
              1000000000 + Math.random() * 9000000000,
            ).toString(),
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    // Send verification email (non-blocking)
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.firstName,
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return NextResponse.json(
      {
        message:
          "User registered successfully. Please check your email to verify your account.",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          wallet: serializeWallet(user.wallet),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
