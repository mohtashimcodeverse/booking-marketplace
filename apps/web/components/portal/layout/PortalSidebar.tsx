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
      <div className="rounded-3xl border border-inverted/14 bg-ink-2 shadow-card">
        <div className="border-b border-inverted/14 px-5 py-4">
          <div className="text-xs font-semibold text-inverted/62">Navigation</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-inverted">
            {props.title}
            <ChevronRight className="h-4 w-4 text-inverted/45" />
          </div>
          {props.subtitle ? <div className="mt-1 text-xs text-inverted/60">{props.subtitle}</div> : null}
        </div>

        <div className="p-4">
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.group} className="border-t border-inverted/8 pt-4 first:border-t-0 first:pt-0">
                <div className="px-2 text-[11px] font-semibold tracking-wide text-inverted/55">
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
                            ? "relative bg-brand/16 text-brand ring-1 ring-inverted/14 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-r-full before:bg-brand"
                            : "text-inverted/82 hover:bg-brand/10"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-xl border",
                              active
                                ? "border-brand/50 bg-brand/18 text-brand"
                                : "border-inverted/12 bg-ink-3 text-inverted/62"
                            )}
                          >
                            {item.icon ?? <ChevronRight className="h-4 w-4" />}
                          </span>
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-inverted/45 group-hover:text-brand" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-inverted/14 bg-ink-3/85 p-4">
            <div className="text-xs font-semibold text-inverted/68">Signed in</div>
            <div className="mt-1 text-sm font-semibold text-inverted">{props.userEmail || "—"}</div>
            <div className="mt-1 text-xs text-inverted/58">
              {props.footerHint ?? "Use the search bar to find items fast."}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
