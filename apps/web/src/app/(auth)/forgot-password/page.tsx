"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { requestPasswordReset } from "@/lib/auth/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Security: always show a generic success message (don’t reveal if email exists)
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await requestPasswordReset({ email });
      setSubmitted(true);
    } catch (err) {
      // Still show generic message to avoid enumeration (backend should too),
      // but we’ll store error for debugging if needed.
      setError(err instanceof Error ? err.message : "Request failed");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We’ll email you a reset link/token">
      {submitted ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-700">
            If an account exists for <span className="font-medium">{email}</span>, you’ll receive
            password reset instructions shortly.
          </p>

          {error ? (
            <p className="text-xs text-neutral-500">
              Note: If you didn’t receive an email, check spam. (Debug: {error})
            </p>
          ) : null}

          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset instructions"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-neutral-600 hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
