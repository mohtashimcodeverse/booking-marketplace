"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
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
  email: string;
};

const DRAFT_KEY = "ll_signup_profile_draft_v1";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <AuthCard
          title="Loading signup"
          subtitle="Preparing registration..."
          eyebrow="Create account"
          showBackHome
          width="xl"
        >
          <div className="h-20" />
        </AuthCard>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}

function SignupPageContent() {
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
      const fullName =
        role === "customer"
          ? `${firstName.trim()} ${lastName.trim()}`.trim()
          : vendorContactName.trim();
      await signup({
        email: email.trim(),
        password,
        fullName: fullName || undefined,
        role: role === "vendor" ? "VENDOR" : "CUSTOMER",
      });
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
        <div className="text-center text-xs text-secondary">
          Already have an account?{" "}
          <Link href={qsLogin} className="font-semibold text-brand hover:underline">
            Sign in
          </Link>{" "}
          •{" "}
          <Link href={qsGateway} className="font-semibold text-brand hover:underline">
            Switch role
          </Link>
        </div>
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-brand-soft px-3 py-1 text-xs font-semibold text-primary">
          <span className="text-brand">{roleIcon}</span>
          {roleLabel} signup
        </div>
        <Link href={qsGateway} className="text-xs font-semibold text-brand hover:underline">
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
          <motion.div variants={rowVariant}>
            <Field label="Contact name">
              <Input value={vendorContactName} onChange={setVendorContactName} placeholder="Your name" autoComplete="name" />
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
            className="rounded-2xl bg-danger/12 px-4 py-3 text-sm text-danger ring-1 ring-danger/30"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3.5 text-sm font-semibold text-text-invert shadow-brand-soft hover:bg-brand-hover disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <p className="text-center text-[11px] text-secondary">
          We’ll use your details to personalize your experience. You can edit them later.
        </p>
      </motion.form>
    </AuthCard>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-primary">
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
      className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-primary shadow-sm outline-none placeholder:text-muted"
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
        className="premium-input w-full rounded-2xl px-4 py-3 pr-12 text-sm text-primary shadow-sm outline-none placeholder:text-muted"
      />
      <button
        type="button"
        onClick={() => props.setShow(!props.show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-secondary hover:bg-brand-soft-2 hover:text-primary"
        aria-label={props.show ? "Hide password" : "Show password"}
      >
        {props.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const rowVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
