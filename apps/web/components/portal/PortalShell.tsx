"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LogOut,
  Search,
  ShieldCheck,
  Building2,
  ClipboardCheck,
  Users,
  CalendarDays,
  CreditCard,
  Wrench,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export type PortalRole = "vendor" | "admin" | "customer";

export type PortalNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  group?: string;
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

function roleLabel(role?: PortalRole): string {
  if (role === "admin") return "Admin Portal";
  if (role === "vendor") return "Vendor Portal";
  if (role === "customer") return "My Account";
  return "Portal";
}

function defaultNav(role?: PortalRole): PortalNavItem[] {
  if (role === "vendor") {
    return [
      { href: "/vendor", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, group: "Workspace" },
      { href: "/vendor/properties", label: "Properties", icon: <Building2 className="h-4 w-4" />, group: "Workspace" },
      { href: "/vendor/bookings", label: "Bookings", icon: <ClipboardCheck className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/ops-tasks", label: "Ops Tasks", icon: <Wrench className="h-4 w-4" />, group: "Operations" },
    ];
  }

  if (role === "admin") {
  return [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, group: "Admin" },
    { href: "/admin/analytics", label: "Analytics", icon: <LayoutDashboard className="h-4 w-4" />, group: "Admin" },
    { href: "/admin/review-queue", label: "Review Queue", icon: <ShieldCheck className="h-4 w-4" />, group: "Admin" },
    { href: "/admin/vendors", label: "Vendors", icon: <Users className="h-4 w-4" />, group: "Admin" },
    { href: "/admin/properties", label: "Properties", icon: <Building2 className="h-4 w-4" />, group: "Admin" },

    { href: "/admin/bookings", label: "Bookings", icon: <ClipboardCheck className="h-4 w-4" />, group: "Operations" },
    { href: "/admin/ops-tasks", label: "Ops Tasks", icon: <Wrench className="h-4 w-4" />, group: "Operations" },

    { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
    { href: "/admin/refunds", label: "Refunds", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
    { href: "/admin/statements", label: "Statements", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
    { href: "/admin/payouts", label: "Payouts", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
  ];
}


  if (role === "customer") {
    return [
      { href: "/account", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, group: "Account" },
      { href: "/account/bookings", label: "My Bookings", icon: <ClipboardCheck className="h-4 w-4" />, group: "Account" },
      { href: "/account/refunds", label: "Refunds", icon: <CreditCard className="h-4 w-4" />, group: "Account" },
    ];
  }

  return [];
}

function groupNav(items: PortalNavItem[]): Array<{ group: string; items: PortalNavItem[] }> {
  const map = new Map<string, PortalNavItem[]>();
  for (const it of items) {
    const g = (it.group ?? "General").trim() || "General";
    const arr = map.get(g) ?? [];
    arr.push(it);
    map.set(g, arr);
  }
  return Array.from(map.entries()).map(([group, its]) => ({ group, items: its }));
}

function initials(email: string): string {
  const v = email.trim();
  if (!v) return "U";
  const left = v.split("@")[0] ?? v;
  const parts = left.split(/[._-]+/g).filter(Boolean);
  const a = parts[0]?.[0] ?? left[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export function PortalShell(props: {
  role?: PortalRole;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  nav?: PortalNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = props.nav ?? defaultNav(props.role);
  const grouped = groupNav(navItems);

  const email = user?.email ?? "";
  const badge = email ? initials(email) : "U";

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      {/* Top bar */}
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
                placeholder="Search inside portal…"
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
                onClick={() => void logout()}
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

          {/* Mobile actions */}
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
              onClick={() => void logout()}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <div className="rounded-3xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-black/5 px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Navigation</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                {props.title}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              {props.subtitle ? <div className="mt-1 text-xs text-slate-500">{props.subtitle}</div> : null}
            </div>

            <div className="p-4">
              <div className="space-y-5">
                {grouped.map((g) => (
                  <div key={g.group}>
                    <div className="px-2 text-[11px] font-semibold tracking-wide text-slate-500">
                      {g.group.toUpperCase()}
                    </div>
                    <div className="mt-2 grid gap-1">
                      {g.items.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={[
                              "group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold",
                              active
                                ? "bg-[#16A6C8]/10 text-slate-900 ring-1 ring-[#16A6C8]/25"
                                : "text-slate-800 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={[
                                  "flex h-8 w-8 items-center justify-center rounded-xl border",
                                  active ? "border-[#16A6C8]/20 bg-white" : "border-black/10 bg-white",
                                ].join(" ")}
                              >
                                {item.icon ?? <ChevronRight className="h-4 w-4 text-slate-500" />}
                              </span>
                              {item.label}
                            </span>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-black/5 bg-[#f6f3ec] p-4">
                <div className="text-xs font-semibold text-slate-700">Signed in</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{email || "—"}</div>
                <div className="mt-1 text-xs text-slate-500">Use the search bar to find items fast.</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="rounded-3xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-black/5 px-5 py-5 sm:px-6">
              <div className="text-xs font-semibold text-slate-500">{roleLabel(props.role)}</div>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">{props.title}</h1>
              {props.subtitle ? <div className="mt-1 text-sm text-slate-600">{props.subtitle}</div> : null}
            </div>

            <div className="px-5 py-6 sm:px-6">{props.children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
