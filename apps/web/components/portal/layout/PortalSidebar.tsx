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
      {/* ✅ Darker panel so it clearly separates from page bg (no borders) */}
      <div className="sticky top-[90px] overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#E7DDCF_0%,#E1D7C9_55%,#D9CFBF_100%)] shadow-[0_28px_78px_rgba(11,15,25,0.16)]">
        {/* subtle inner highlight so it feels “built” */}
        <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.55)]" />

        {/* ✅ Top section as its own distinct “header block” */}
        <div className="px-4 pt-4">
          <div className="rounded-3xl bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.62)_100%)] p-4 shadow-[0_16px_46px_rgba(11,15,25,0.10)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-wide text-[#0B0F19]/60">Navigation</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-sm font-semibold text-primary">{props.title}</div>
                  <ChevronRight className="h-4 w-4 text-[#0B0F19]/38" />
                </div>

                {props.subtitle ? (
                  <div className="mt-1 text-xs leading-relaxed text-[#0B0F19]/62">{props.subtitle}</div>
                ) : null}
              </div>

              {/* gold badge */}
              <div className="mt-0.5 inline-flex h-8 items-center rounded-2xl bg-[rgba(198,169,109,0.16)] px-3 text-[11px] font-semibold text-[#6B5630] shadow-[0_10px_22px_rgba(11,15,25,0.08)]">
                L&L
              </div>
            </div>

            <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.70),rgba(79,70,229,0.10),rgba(11,15,25,0.0))]" />
          </div>
        </div>

        <div className="px-4 pb-4 pt-4">
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.group} className="pt-1">
                <div className="px-2 text-[11px] font-semibold tracking-wide text-[#0B0F19]/58">
                  {group.group.toUpperCase()}
                </div>
                <div className="mt-2 h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.34),rgba(11,15,25,0.0))]" />

                {/* ✅ Raised pills for ALL nav items */}
                <div className="mt-3 grid gap-2.5">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold",
                          // Default raised pill
                          "bg-white/86 shadow-[0_10px_28px_rgba(11,15,25,0.10)] transition",
                          // Hover lift
                          "hover:translate-y-[-1px] hover:bg-white hover:shadow-[0_14px_34px_rgba(11,15,25,0.14)] active:translate-y-0",
                          active ? "text-primary" : "text-[#0B0F19]/78"
                        )}
                      >
                        {/* subtle gold active rail (not a border) */}
                        {active ? (
                          <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#C6A96D]" />
                        ) : null}

                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-xl transition",
                              // icon base
                              "bg-[rgba(11,15,25,0.04)] text-secondary",
                              // hover warmth
                              "group-hover:bg-[rgba(198,169,109,0.14)] group-hover:text-[#0B0F19]",
                              // active warmth
                              active ? "bg-[rgba(198,169,109,0.18)] text-[#0B0F19]" : ""
                            )}
                          >
                            {item.icon ?? <ChevronRight className="h-4 w-4" />}
                          </span>

                          <span className={cn(active ? "text-primary" : "text-[#0B0F19]/78 group-hover:text-primary")}>
                            {item.label}
                          </span>
                        </span>

                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition",
                            active ? "text-[#0B0F19]/45" : "text-[#0B0F19]/28 group-hover:text-[#0B0F19]/48"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-[rgba(255,255,255,0.74)] p-4 shadow-[0_14px_40px_rgba(11,15,25,0.12)]">
            <div className="text-xs font-semibold text-[#0B0F19]/60">Signed in</div>
            <div className="mt-1 text-sm font-semibold text-primary">{props.userEmail || "—"}</div>
            <div className="mt-1 text-xs leading-relaxed text-[#0B0F19]/62">
              {props.footerHint ?? "Use the search bar to find items fast."}
            </div>
            <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.40),rgba(11,15,25,0.0))]" />
            <div className="mt-3 text-[11px] font-semibold text-[#6B5630]">
              Premium operator console
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
