"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Home, LogOut, Search } from "lucide-react";
import type { PortalRole } from "@/components/portal/layout/portal-navigation";
import { roleLabel } from "@/components/portal/layout/portal-navigation";

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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f6f3ec]/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <Home className="h-4 w-4 text-slate-900" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-500">{roleLabel(props.role)}</div>
            <div className="text-sm font-semibold text-slate-900">{props.title}</div>
          </div>
        </Link>

        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <div className="relative w-full max-w-[560px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search inside portal..."
              className="h-11 w-full rounded-2xl border border-black/10 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {props.right ? <div className="shrink-0">{props.right}</div> : null}

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden xl:inline">Alerts</span>
            </button>

            <button
              type="button"
              onClick={props.onLogout}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <div className="ml-1 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                {badge}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-slate-900">{email || "Signed in"}</div>
                <div className="text-[11px] text-slate-500">{props.role ?? "user"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {props.right ? <div className="shrink-0">{props.right}</div> : null}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={props.onLogout}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
