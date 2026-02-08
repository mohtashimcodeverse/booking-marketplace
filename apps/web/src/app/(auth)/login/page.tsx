"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Building2, User2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { login } from "@/lib/auth/authApi";
import { useAuth } from "@/lib/auth/auth-context";

type UiRole = "customer" | "vendor";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  return raw;
}

function readRole(raw: string | null): UiRole {
  return raw === "vendor" ? "vendor" : "customer";
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthCard
          title="Loading login"
          subtitle="Preparing sign-in..."
          eyebrow="Secure access"
          showBackHome
        >
          <div className="h-20" />
        </AuthCard>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const nextPath = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const role = useMemo<UiRole>(() => readRole(searchParams.get("role")), [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel = role === "vendor" ? "Vendor" : "Customer";
  const roleIcon = role === "vendor" ? <Building2 className="h-4 w-4" /> : <User2 className="h-4 w-4" />;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      await refresh(); // header updates instantly
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const qsGateway = useMemo(() => {
    const qs = new URLSearchParams({ mode: "login", role });
    return `/auth?${qs.toString()}`;
  }, [role]);

  const qsSignup = useMemo(() => {
    const qs = new URLSearchParams({ role, next: nextPath });
    return `/signup?${qs.toString()}`;
  }, [role, nextPath]);

  return (
    <AuthCard
      title={`Sign in as ${roleLabel}`}
      subtitle={role === "vendor" ? "Manage listings, bookings, and ops tasks." : "Manage bookings, payments, and refunds."}
      eyebrow="Secure access"
      showBackHome
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[color:var(--tourm-ink)]">
          <span className="text-[color:var(--tourm-primary)]">{roleIcon}</span>
          {roleLabel} login
        </div>
        <Link href={qsGateway} className="text-xs font-semibold text-[color:var(--tourm-ink)] hover:underline">
          Switch
        </Link>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.div variants={fieldVariant}>
          <label className="mb-1.5 block text-xs font-semibold text-[color:var(--tourm-ink)]">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[color:var(--tourm-ink)] shadow-sm outline-none placeholder:text-black/30 focus:border-[color:var(--tourm-primary)] focus:ring-4 focus:ring-[color:var(--tourm-primary)]/15"
          />
        </motion.div>

        <motion.div variants={fieldVariant}>
          <label className="mb-1.5 block text-xs font-semibold text-[color:var(--tourm-ink)]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 pr-12 text-sm text-[color:var(--tourm-ink)] shadow-sm outline-none placeholder:text-black/30 focus:border-[color:var(--tourm-primary)] focus:ring-4 focus:ring-[color:var(--tourm-primary)]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[color:var(--tourm-muted)] hover:bg-black/5 hover:text-[color:var(--tourm-ink)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>

        {error ? (
          <motion.p
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        ) : null}

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--tourm-primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(22,166,200,0.20)] hover:brightness-[0.98] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <div className="flex items-center justify-between pt-1">
          <Link href="/forgot-password" className="text-xs font-semibold text-[color:var(--tourm-ink)] hover:underline">
            Forgot password?
          </Link>
          <Link href={qsSignup} className="text-xs font-semibold text-[color:var(--tourm-ink)] hover:underline">
            Create account
          </Link>
        </div>
      </motion.form>
    </AuthCard>
  );
}

const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
