"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { PortalNavItem } from "@/components/portal/layout/portal-navigation";
import { groupNav } from "@/components/portal/layout/portal-navigation";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function PortalSidebar(props: {
  title: string;
  subtitle?: string;
  nav: PortalNavItem[];
  userEmail: string | null;
  footerHint?: ReactNode;
}) {
  const pathname = usePathname();
  const grouped = groupNav(props.nav);

  return (
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
            {grouped.map((group) => (
              <div key={group.group}>
                <div className="px-2 text-[11px] font-semibold tracking-wide text-slate-500">
                  {group.group.toUpperCase()}
                </div>
                <div className="mt-2 grid gap-1">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold",
                          active
                            ? "bg-[#16A6C8]/10 text-slate-900 ring-1 ring-[#16A6C8]/25"
                            : "text-slate-800 hover:bg-slate-50"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-xl border",
                              active ? "border-[#16A6C8]/20 bg-white" : "border-black/10 bg-white"
                            )}
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
            <div className="mt-1 text-sm font-semibold text-slate-900">{props.userEmail || "—"}</div>
            <div className="mt-1 text-xs text-slate-500">
              {props.footerHint ?? "Use the search bar to find items fast."}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
