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

    // Parse form data
    const formData = await request.formData();
    const type = formData.get("type") as string;
    const documentNumber = formData.get("documentNumber") as string;
    const issuingCountry = formData.get("issuingCountry") as string;
    const expiryDate = formData.get("expiryDate") as string;
    const frontImage = formData.get("frontImage") as File;
    const backImage = formData.get("backImage") as File;

    if (!type || !frontImage) {
      return NextResponse.json(
        { error: "Document type and front image are required" },
        { status: 400 },
      );
    }

    // Save files (in production, upload to S3/Cloudinary)
    const frontPath = `/uploads/documents/${Date.now()}-front-${frontImage.name}`;
    const backPath = backImage
      ? `/uploads/documents/${Date.now()}-back-${backImage.name}`
      : null;

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId: decoded.userId,
        type,
        documentNumber,
        issuingCountry,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        frontImage: frontPath,
        backImage: backPath,
        status: "pending",
      },
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        kycStatus: "submitted",
        kycSubmittedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}
