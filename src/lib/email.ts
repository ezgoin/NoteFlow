import { Resend } from "resend";
import crypto from "crypto";
import prisma from "@/lib/prisma";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export async function generateVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      token,
      email,
      expires,
    },
  });

  return token;
}

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = getAppUrl();
  const verifyUrl = `${appUrl}/api/verify-email?token=${token}`;

  const resend = getResend();
  await resend.emails.send({
    from: "NoteFlow <onboarding@resend.dev>",
    to: email,
    subject: "Verify your NoteFlow account",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #4f46e5; font-size: 28px; margin-bottom: 8px;">NoteFlow</h1>
        <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Verify your email address</h2>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Thanks for signing up! Please click the button below to verify your email address and activate your account.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 32px; border-radius: 8px; margin-bottom: 24px;">
          Verify Email
        </a>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin-top: 24px;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          If the button doesn't work, copy and paste this URL into your browser:<br/>
          <a href="${verifyUrl}" style="color: #4f46e5; word-break: break-all;">${verifyUrl}</a>
        </p>
      </div>
    `,
  });
}
