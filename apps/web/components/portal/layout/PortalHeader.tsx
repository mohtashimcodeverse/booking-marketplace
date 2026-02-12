"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut, Search } from "lucide-react";
import type { PortalRole } from "@/components/portal/layout/portal-navigation";
import { roleLabel } from "@/components/portal/layout/portal-navigation";
import CurrencySwitcher from "@/components/currency/CurrencySwitcher";

export function initials(email: string): string {
  const value = email.trim();
  if (!value) return "U";

  const local = value.split("@")[0] ?? value;
  const parts = local.split(/[._-]+/g).filter(Boolean);
  const first = parts[0]?.[0] ?? local[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function PortalHeader(props: {
  role?: PortalRole;
  title: string;
  right?: ReactNode;
  userEmail: string | null;
  onLogout: () => void;
}) {
  const email = props.userEmail ?? "";
  const badge = email ? initials(email) : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2">
          <Image
            src="/brand/logo.svg"
            alt="Laugh & Lodge"
            width={150}
            height={48}
            className="h-9 w-auto"
            priority
          />
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-muted">{roleLabel(props.role)}</div>
            <div className="text-sm font-semibold text-primary">{props.title}</div>
          </div>
        </Link>

        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <div className="relative w-full max-w-[560px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search inside portal..."
              className="h-11 w-full rounded-2xl border border-line bg-surface pl-10 pr-3 text-sm text-primary shadow-sm outline-none placeholder:text-muted focus:border-brand/55 focus:ring-4 focus:ring-brand/20"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {props.right ? <div className="shrink-0">{props.right}</div> : null}

            <CurrencySwitcher compact />

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line bg-surface px-4 text-sm font-semibold text-primary shadow-sm hover:bg-bg-2"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden xl:inline">Alerts</span>
            </button>

            <button
              type="button"
              onClick={props.onLogout}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-brand px-4 text-sm font-semibold text-text-invert shadow-sm hover:bg-brand-hover"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <div className="ml-1 flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-xs font-bold text-text-invert">
                {badge}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-primary">{email || "Signed in"}</div>
                <div className="text-[11px] text-muted">{props.role ?? "user"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {props.right ? <div className="shrink-0">{props.right}</div> : null}

          <CurrencySwitcher compact />

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-line/80 bg-surface shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={props.onLogout}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-brand px-4 text-sm font-semibold text-text-invert shadow-sm hover:bg-brand-hover"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
