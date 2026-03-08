"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    setResent(false);

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend verification email");
      } else {
        setResent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light">
        <Mail className="h-7 w-7 text-accent" />
      </div>

      <h2 className="text-lg font-semibold text-text-primary mb-2">
        Check your email
      </h2>

      <p className="text-sm text-text-tertiary mb-1">
        We&apos;ve sent a verification link to
      </p>

      {email && (
        <p className="text-sm font-medium text-text-primary mb-6">
          {email}
        </p>
      )}

      {!email && (
        <p className="text-sm text-text-tertiary mb-6">your email address</p>
      )}

      <p className="text-sm text-text-tertiary mb-6">
        Click the link in the email to verify your account. The link will
        expire in 24 hours.
      </p>

      {resent && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Verification email resent!
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      <Button
        variant="secondary"
        size="md"
        className="w-full"
        onClick={handleResend}
        loading={resending}
        disabled={!email}
      >
        <RefreshCw className="h-4 w-4" />
        Resend verification email
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-accent">NoteFlow</h1>
        </div>

        <Suspense>
          <VerifyEmailContent />
        </Suspense>

        <p className="mt-6 text-center text-sm text-text-tertiary">
          Already verified?{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:opacity-80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
