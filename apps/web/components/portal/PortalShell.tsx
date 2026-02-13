"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PortalHeader } from "@/components/portal/layout/PortalHeader";
import {
  getRoleNav,
  roleLabel,
  type PortalNavItem,
  type PortalRole,
} from "@/components/portal/layout/portal-navigation";
import { PortalSidebar } from "@/components/portal/layout/PortalSidebar";

export type { PortalRole, PortalNavItem };

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function PortalShell(props: {
  role?: PortalRole;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  nav?: PortalNavItem[];
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Enforce one role-aware sidebar source across all portals.
  const navItems = getRoleNav(props.role);

  return (
    <div className="portal-density min-h-screen">
      {/* Background layer (portal-wide) */}
      <div className="pointer-events-none fixed inset-0 -z-10 portal-shell-bg" />

      {/* Soft vignette to increase separation (prevents “white on white”) */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-120px,rgba(79,70,229,0.10),transparent_60%),radial-gradient(900px_500px_at_12%_10%,rgba(198,169,109,0.14),transparent_55%),radial-gradient(900px_500px_at_88%_18%,rgba(11,15,25,0.08),transparent_62%)]" />

      <PortalHeader
        role={props.role}
        title={props.title}
        right={props.right}
        userEmail={user?.email ?? null}
        onLogout={async () => {
          await logout();
          router.replace("/");
        }}
      />

      {/* Mobile top nav */}
      <div className="px-4 py-3 lg:hidden">
        <div className="no-scrollbar mx-auto flex max-w-[1400px] gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold",
                  "shadow-[0_12px_28px_rgba(11,15,25,0.10)] transition",
                  active
                    ? "bg-[linear-gradient(135deg,rgba(198,169,109,0.30),rgba(198,169,109,0.18))] text-[#1d2a73] ring-1 ring-[rgba(198,169,109,0.45)]"
                    : "bg-white/72 text-primary ring-1 ring-black/5 hover:bg-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md",
                    active ? "bg-[rgba(198,169,109,0.22)]" : "bg-black/10"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Layout */}
      <div className="mx-auto grid max-w-[1400px] gap-4 px-3 pb-10 pt-4 sm:px-5 sm:pt-5 lg:grid-cols-[300px_1fr] lg:gap-6 lg:px-8 lg:pb-16 lg:pt-6">
        <PortalSidebar
          title={props.title}
          subtitle={props.subtitle}
          nav={navItems}
          userEmail={user?.email ?? null}
        />

        <main className="min-w-0">
          {/* Main shell card */}
          <div className="premium-card rounded-3xl overflow-hidden">
            {/* Header band: increase contrast so it reads clearly on ivory */}
            <div className="relative bg-[linear-gradient(135deg,rgba(255,255,255,0.70),rgba(243,238,229,0.70))] px-5 py-5 sm:px-6 shadow-[0_18px_48px_rgba(11,15,25,0.08)]">
              {/* Top accent line */}
              <div className="pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full bg-[linear-gradient(90deg,rgba(198,169,109,0.70),rgba(79,70,229,0.35),transparent_82%)]" />
              {/* Soft border glow */}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5" />

              <div className="text-xs font-semibold text-muted">{roleLabel(props.role)}</div>
              <h1 className="mt-1 text-xl font-semibold text-primary sm:text-2xl">{props.title}</h1>
              {props.subtitle ? (
                <div className="mt-1 text-sm text-secondary">{props.subtitle}</div>
              ) : null}

              <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.40),rgba(11,15,25,0.10),transparent_82%)]" />
            </div>

            {/* Content area: add subtle tint so pages like Calendar don’t look “flat” */}
            <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.35))] px-4 py-5 sm:px-6 sm:py-6">
              {props.children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
