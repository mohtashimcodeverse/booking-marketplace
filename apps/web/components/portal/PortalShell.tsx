"use client";

import type { ReactNode } from "react";
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

export function PortalShell(props: {
  role?: PortalRole;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  nav?: PortalNavItem[];
  children: ReactNode;
}) {
  const { user, logout } = useAuth();

  // Enforce one role-aware sidebar source across all portals.
  // `nav` remains in the prop contract only for backwards compatibility.
  const navItems = getRoleNav(props.role);

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <PortalHeader
        role={props.role}
        title={props.title}
        right={props.right}
        userEmail={user?.email ?? null}
        onLogout={() => {
          void logout();
        }}
      />

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <PortalSidebar
          title={props.title}
          subtitle={props.subtitle}
          nav={navItems}
          userEmail={user?.email ?? null}
        />

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
