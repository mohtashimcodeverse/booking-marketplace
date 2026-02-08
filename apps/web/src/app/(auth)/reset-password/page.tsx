"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { resetPassword } from "@/lib/auth/authApi";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Loading reset form" subtitle="Preparing password reset...">
          <div className="h-20" />
        </AuthCard>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await resetPassword({ token, newPassword });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Set a new password" subtitle="Use your reset token to create a new password">
      {done ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-700">Your password has been updated.</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Continue to login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />

          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update password"}
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
