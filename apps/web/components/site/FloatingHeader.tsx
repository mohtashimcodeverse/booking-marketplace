"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/auth/auth.types";

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

  const shellStyle = useMemo(() => {
    // Tourm-ish: always readable, never “washed out”
    const bg = `rgba(255,255,255,${0.88 + progress * 0.10})`;
    const border = `rgba(15,23,42,${0.10 + progress * 0.08})`;
    const blur = 14 + progress * 8;
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
              "pointer-events-auto mt-4 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-[0_14px_40px_rgba(2,10,20,0.10)]",
              "transition-[transform] duration-300",
            ].join(" ")}
            style={shellStyle}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#16a6c8] text-white shadow-[0_10px_30px_rgba(22,166,200,0.25)]">
                <span className="text-sm font-semibold">LL</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900">Laugh &amp; Lodge</div>
                <div className="text-xs text-slate-600">Vocation Homes Rental</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-slate-800/90 transition hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/properties"
                className="hidden rounded-2xl bg-[#16a6c8] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(22,166,200,0.25)] transition hover:brightness-95 lg:inline-flex"
              >
                Explore
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              {/* Desktop auth actions */}
              <div className="hidden items-center gap-2 lg:flex">
                {showAuthSkeleton ? (
                  <div className="h-10 w-[180px] animate-pulse rounded-2xl bg-slate-200/70" />
                ) : user ? (
                  <>
                    <Link
                      href={dashboardHref}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      title="Open your dashboard"
                    >
                      <UserRound className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
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
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 lg:hidden"
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
            className="fixed inset-0 z-[70] bg-slate-950/25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="absolute left-4 right-4 top-[88px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl"
              initial={{ y: -10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Auth area */}
              <div className="mb-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                {showAuthSkeleton ? (
                  <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-200/80" />
                ) : user ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {user.email}
                      </div>
                      <div className="text-xs text-slate-600">
                        Role: {user.role}
                        {!user.isEmailVerified ? " • Email not verified" : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Sign up
                    </Link>
                  </div>
                )}

                {user ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
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
                    className="rounded-2xl px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#16a6c8] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(22,166,200,0.25)]"
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
