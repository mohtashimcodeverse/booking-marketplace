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
      <div className="sticky top-[90px] rounded-3xl border border-inverted/14 bg-[linear-gradient(160deg,#26368f_0%,#1d2a73_60%,#111736_100%)] shadow-card">
        <div className="border-b border-inverted/14 px-5 py-4">
          <div className="text-xs font-semibold text-inverted/65">Navigation</div>
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
                            ? "relative bg-white text-[#1d2a73] ring-1 ring-white/20 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-r-full before:bg-[#1d2a73]"
                            : "text-inverted hover:bg-white/12"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-xl border",
                              active
                                ? "border-[#1d2a73]/20 bg-[#1d2a73]/10 text-[#1d2a73]"
                                : "border-inverted/16 bg-black/20 text-inverted/72"
                            )}
                          >
                            {item.icon ?? <ChevronRight className="h-4 w-4" />}
                          </span>
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-inverted/45 group-hover:text-inverted" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-inverted/14 bg-black/24 p-4">
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
