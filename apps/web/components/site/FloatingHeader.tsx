"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/auth/auth.types";
import CurrencySwitcher from "@/components/currency/CurrencySwitcher";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Stays" },
  { href: "/services", label: "Services" },
  { href: "/owners", label: "For Owners" },
  { href: "/gallery", label: "Gallery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "VENDOR":
      return "/vendor";
    case "CUSTOMER":
    default:
      return "/account";
  }
}

export default function FloatingHeader() {
  const { status, user, logout } = useAuth();
  const pathname = usePathname();

  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const dashboardHref = user ? dashboardPathForRole(user.role) : "/account";

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || 0;
      setProgress(clamp01(y / 220));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isSolid = progress > 0.12;
  const topGlassClass = isSolid
    ? "border-line bg-surface text-primary hover:bg-bg-2"
    : "border-line/85 bg-surface/92 text-primary hover:bg-bg-2";

  const shellStyle = useMemo(() => {
    const bgAlpha = 0.88 + progress * 0.10;
    const bg = `rgba(255,255,255,${Math.min(bgAlpha, 0.98)})`;
    const border = `rgba(11,15,25,${0.10 + progress * 0.06})`;
    const blur = 14 + progress * 4;
    return {
      backgroundColor: bg,
      borderColor: border,
      backdropFilter: `blur(${blur}px)`,
    } as const;
  }, [progress]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setMobileOpen(false);
    } finally {
      setLoggingOut(false);
    }
  }

  const showAuthSkeleton = status === "loading";

  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-[60] w-full">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.header
            className={[
              "pointer-events-auto mt-4 flex items-center justify-between rounded-2xl border px-4 py-3 transition-[transform,box-shadow,border-color] duration-300",
              isSolid
                ? "shadow-[0_14px_38px_rgba(11,15,25,0.16)]"
                : "shadow-[0_10px_28px_rgba(11,15,25,0.10)]",
            ].join(" ")}
            style={shellStyle}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/logo.svg"
                alt="Laugh & Lodge"
                width={180}
                height={64}
                priority
                className="h-10 w-auto"
              />
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "relative text-sm font-semibold transition",
                    isActive(pathname, item.href)
                      ? "text-brand after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-brand"
                      : "text-primary/88 hover:text-brand",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <CurrencySwitcher compact />
              </div>

              <Link
                href="/properties"
                className="hidden rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-text-invert shadow-brand-soft transition hover:bg-brand-hover lg:inline-flex"
              >
                Explore
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              {/* Desktop auth actions */}
              <div className="hidden items-center gap-2 lg:flex">
                {showAuthSkeleton ? (
                  <div className="h-10 w-[180px] animate-pulse rounded-2xl bg-warm-alt/70" />
                ) : user ? (
                  <>
                    <Link
                      href={dashboardHref}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${topGlassClass}`}
                      title="Open your dashboard"
                    >
                      <UserRound className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-text-invert shadow-sm transition hover:bg-brand-hover disabled:opacity-60"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                      {loggingOut ? "Logging out…" : "Logout"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition ${topGlassClass}`}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-text-invert shadow-sm transition hover:bg-brand-hover"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>

              <div className="lg:hidden">
                <CurrencySwitcher compact />
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-line/80 bg-surface text-primary lg:hidden"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </motion.header>
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="absolute left-4 right-4 top-[88px] rounded-3xl border border-line bg-surface p-4 shadow-xl"
              initial={{ y: -10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Auth area */}
              <div className="mb-3 rounded-3xl border border-line bg-warm-alt p-3">
                {showAuthSkeleton ? (
                  <div className="h-10 w-full animate-pulse rounded-2xl bg-warm-alt/80" />
                ) : user ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-primary">
                        {user.email}
                      </div>
                      <div className="text-xs text-secondary">
                        Role: {user.role}
                        {!user.isEmailVerified ? " • Email not verified" : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="inline-flex items-center gap-2 rounded-2xl bg-brand px-3 py-2 text-sm font-semibold text-text-invert disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      {loggingOut ? "…" : "Logout"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-text-invert"
                    >
                      Sign up
                    </Link>
                  </div>
                )}

                {user ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary"
                  >
                    Open dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : null}
              </div>

              {/* Nav */}
              <div className="grid gap-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "rounded-2xl px-3 py-3 text-sm font-semibold transition",
                      isActive(pathname, item.href)
                        ? "bg-brand-soft text-brand"
                        : "text-primary hover:bg-warm-alt",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-text-invert shadow-brand-soft"
              >
                Explore stays
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
