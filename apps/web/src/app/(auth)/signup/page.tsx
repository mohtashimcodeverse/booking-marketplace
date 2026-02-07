"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Building2, User2, Eye, EyeOff } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { signup } from "@/lib/auth/authApi";

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

type SignupDraft = {
  role: UiRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  vendorContactName?: string;
  vendorBusinessName?: string;
  email: string;
};

const DRAFT_KEY = "ll_signup_profile_draft_v1";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const role = useMemo<UiRole>(() => readRole(searchParams.get("role")), [searchParams]);

  const roleLabel = role === "vendor" ? "Vendor" : "Customer";
  const roleIcon = role === "vendor" ? <Building2 className="h-4 w-4" /> : <User2 className="h-4 w-4" />;

  // shared
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // customer
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // vendor
  const [vendorContactName, setVendorContactName] = useState("");
  const [vendorBusinessName, setVendorBusinessName] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qsGateway = useMemo(() => {
    const qs = new URLSearchParams({ mode: "signup", role });
    return `/auth?${qs.toString()}`;
  }, [role]);

  const qsLogin = useMemo(() => {
    const qs = new URLSearchParams({ role, next: nextPath });
    return `/login?${qs.toString()}`;
  }, [role, nextPath]);

  function validate(): string | null {
    if (!email.trim()) return "Email is required.";
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";

    if (role === "customer") {
      if (!firstName.trim()) return "First name is required.";
      if (!lastName.trim()) return "Last name is required.";
      if (!phone.trim()) return "Phone number is required.";
    } else {
      if (!vendorContactName.trim()) return "Contact name is required.";
      if (!vendorBusinessName.trim()) return "Business name is required.";
      if (!phone.trim()) return "Phone number is required.";
    }
    return null;
  }

  function persistDraft() {
    const draft: SignupDraft =
      role === "customer"
        ? {
            role,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            email: email.trim(),
          }
        : {
            role,
            vendorContactName: vendorContactName.trim(),
            vendorBusinessName: vendorBusinessName.trim(),
            phone: phone.trim(),
            email: email.trim(),
          };

    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      persistDraft();
      await signup({ email: email.trim(), password });
      const qs = new URLSearchParams({ role, next: nextPath });
      router.push(`/login?${qs.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={`Sign up as ${roleLabel}`}
      subtitle={role === "vendor" ? "List homes, manage availability, operate bookings." : "Book premium stays in minutes — verified and smooth."}
      eyebrow="Create account"
      showBackHome
      width="xl"
      footnote={
        <div className="text-center text-xs text-[color:var(--tourm-muted)]">
          Already have an account?{" "}
          <Link href={qsLogin} className="font-semibold text-[color:var(--tourm-ink)] hover:underline">
            Sign in
          </Link>{" "}
          •{" "}
          <Link href={qsGateway} className="font-semibold text-[color:var(--tourm-ink)] hover:underline">
            Switch role
          </Link>
        </div>
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[color:var(--tourm-ink)]">
          <span className="text-[color:var(--tourm-primary)]">{roleIcon}</span>
          {roleLabel} signup
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
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {role === "customer" ? (
          <motion.div variants={rowVariant} className="grid gap-3 sm:grid-cols-2">
            <Field label="First name">
              <Input value={firstName} onChange={setFirstName} placeholder="John" autoComplete="given-name" />
            </Field>
            <Field label="Last name">
              <Input value={lastName} onChange={setLastName} placeholder="Doe" autoComplete="family-name" />
            </Field>
          </motion.div>
        ) : (
          <motion.div variants={rowVariant} className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact name">
              <Input value={vendorContactName} onChange={setVendorContactName} placeholder="Your name" autoComplete="name" />
            </Field>
            <Field label="Business name">
              <Input value={vendorBusinessName} onChange={setVendorBusinessName} placeholder="Company / Brand" autoComplete="organization" />
            </Field>
          </motion.div>
        )}

        <motion.div variants={rowVariant} className="grid gap-3 sm:grid-cols-2">
          <Field label="Email">
            <Input type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={setPhone} placeholder="+971 50 123 4567" autoComplete="tel" />
          </Field>
        </motion.div>

        <motion.div variants={rowVariant} className="grid gap-3 sm:grid-cols-2">
          <Field label="Password">
            <PasswordInput value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password">
            <PasswordInput value={confirm} onChange={setConfirm} show={showPassword} setShow={setShowPassword} autoComplete="new-password" />
          </Field>
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
          {loading ? "Creating account…" : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <p className="text-center text-[11px] text-[color:var(--tourm-muted)]">
          We’ll use your details to personalize your experience. You can edit them later.
        </p>
      </motion.form>
    </AuthCard>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[color:var(--tourm-ink)]">
        {props.label}
      </label>
      {props.children}
    </div>
  );
}

function Input(props: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: "text" | "email";
  autoComplete?: string;
}) {
  return (
    <input
      type={props.type ?? "text"}
      required
      autoComplete={props.autoComplete}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[color:var(--tourm-ink)] shadow-sm outline-none placeholder:text-black/30 focus:border-[color:var(--tourm-primary)] focus:ring-4 focus:ring-[color:var(--tourm-primary)]/15"
    />
  );
}

function PasswordInput(props: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <input
        type={props.show ? "text" : "password"}
        required
        autoComplete={props.autoComplete}
        placeholder="••••••••"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 pr-12 text-sm text-[color:var(--tourm-ink)] shadow-sm outline-none placeholder:text-black/30 focus:border-[color:var(--tourm-primary)] focus:ring-4 focus:ring-[color:var(--tourm-primary)]/15"
      />
      <button
        type="button"
        onClick={() => props.setShow(!props.show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[color:var(--tourm-muted)] hover:bg-black/5 hover:text-[color:var(--tourm-ink)]"
        aria-label={props.show ? "Hide password" : "Show password"}
      >
        {props.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const rowVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
