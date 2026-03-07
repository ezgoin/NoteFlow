import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check user exists and is not already verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: "If an account exists with that email, a verification link has been sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified. You can sign in." });
    }

    // Rate limit: check if a token was created in the last 60 seconds
    const recentToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentToken) {
      return NextResponse.json(
        { error: "Please wait at least 60 seconds before requesting a new verification email." },
        { status: 429 }
      );
    }

    const token = await generateVerificationToken(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
