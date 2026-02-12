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
          <p className="text-sm text-secondary">
            If an account exists for <span className="font-medium">{email}</span>, you’ll receive
            password reset instructions shortly.
          </p>

          {error ? (
            <p className="text-xs text-muted">
              Note: If you didn’t receive an email, check spam. (Debug: {error})
            </p>
          ) : null}

          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand py-3 text-sm font-medium text-text-invert hover:bg-brand-hover"
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
            className="premium-input w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-text-invert shadow-brand-soft hover:bg-brand-hover disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset instructions"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm font-semibold text-brand hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
