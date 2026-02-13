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
    <header className="sticky top-0 z-40 bg-[rgba(255,255,255,0.78)] text-primary shadow-[0_14px_40px_rgba(11,15,25,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="rounded-xl bg-white px-2 py-1 shadow-[0_10px_26px_rgba(11,15,25,0.10)]">
            <Image
              src="/brand/logo.svg"
              alt="Laugh & Lodge"
              width={150}
              height={48}
              className="h-7 w-auto sm:h-8"
              priority
            />
          </span>

          <div className="hidden sm:block">
            <div className="inline-flex items-center gap-2">
              <div className="text-xs font-semibold text-secondary">{roleLabel(props.role)}</div>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C6A96D]/90" />
              <div className="text-xs font-semibold text-[#C6A96D]">Operations</div>
            </div>
            <div className="text-sm font-semibold text-primary">{props.title}</div>
          </div>
        </Link>

        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <div className="relative w-full max-w-[560px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <input
              type="search"
              placeholder="Search inside portal..."
              className="h-11 w-full rounded-2xl bg-white pl-10 pr-3 text-sm text-primary shadow-[0_10px_28px_rgba(11,15,25,0.08)] outline-none placeholder:text-muted focus:ring-4 focus:ring-[rgba(198,169,109,0.18)]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {props.right ? <div className="shrink-0">{props.right}</div> : null}

            <CurrencySwitcher compact />

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-primary shadow-[0_10px_28px_rgba(11,15,25,0.08)] hover:translate-y-[-1px] hover:shadow-[0_14px_34px_rgba(11,15,25,0.12)] active:translate-y-0 active:shadow-[0_10px_28px_rgba(11,15,25,0.08)]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-secondary" />
              <span className="hidden xl:inline">Alerts</span>
            </button>

            <button
              type="button"
              onClick={props.onLogout}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0B0F19] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(11,15,25,0.18)] hover:bg-[#111827] hover:translate-y-[-1px] hover:shadow-[0_16px_36px_rgba(11,15,25,0.22)] active:translate-y-0"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <div className="ml-1 flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-[0_10px_28px_rgba(11,15,25,0.08)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B0F19] text-xs font-bold text-white">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_10px_28px_rgba(11,15,25,0.08)] hover:translate-y-[-1px] hover:shadow-[0_14px_34px_rgba(11,15,25,0.12)] active:translate-y-0"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-secondary" />
          </button>

          <button
            type="button"
            onClick={props.onLogout}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#0B0F19] px-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(11,15,25,0.18)] hover:bg-[#111827] hover:translate-y-[-1px] hover:shadow-[0_16px_36px_rgba(11,15,25,0.22)] active:translate-y-0"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
