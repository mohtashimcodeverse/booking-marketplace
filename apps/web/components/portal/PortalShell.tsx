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
  // `nav` remains in the prop contract only for backwards compatibility.
  const navItems = getRoleNav(props.role);

  return (
    <div className="portal-density min-h-screen bg-bg">
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

      <div className="border-b border-line/50 bg-surface/80 px-4 py-3 lg:hidden">
        <div className="no-scrollbar mx-auto flex max-w-[1400px] gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-brand text-accent-text shadow-sm ring-1 ring-brand/50"
                    : "bg-surface text-primary ring-1 ring-line/70 hover:bg-bg-2",
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black/10">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-4 px-3 pb-10 pt-4 sm:px-5 sm:pt-5 lg:gap-6 lg:px-8 lg:pb-16 lg:pt-6">
        <PortalSidebar
          title={props.title}
          subtitle={props.subtitle}
          nav={navItems}
          userEmail={user?.email ?? null}
        />

        <main className="min-w-0 flex-1">
          <div className="premium-card rounded-3xl">
            <div className="border-b border-line/50 bg-bg-2/82 px-5 py-5 sm:px-6">
              <div className="text-xs font-semibold text-muted">{roleLabel(props.role)}</div>
              <h1 className="mt-1 text-xl font-semibold text-primary sm:text-2xl">{props.title}</h1>
              {props.subtitle ? <div className="mt-1 text-sm text-secondary">{props.subtitle}</div> : null}
            </div>

            <div className="px-4 py-5 sm:px-6 sm:py-6">{props.children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
