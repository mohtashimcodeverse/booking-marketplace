"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, Mail, Users } from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { EmptyState } from "@/components/portal/ui/EmptyState";

import { getAdminVendors } from "@/lib/api/portal/admin";

type AdminVendorsResponse = Awaited<ReturnType<typeof getAdminVendors>>;
type VendorRow = AdminVendorsResponse["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminVendorsResponse };

function pickVendorString(vendor: VendorRow, keys: ReadonlyArray<string>): string | null {
  for (const key of keys) {
    const value = vendor[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function toneForStatus(status?: string | null) {
  if (!status) return "neutral" as const;
  if (status.includes("APPROV") || status.includes("ACTIVE")) return "success" as const;
  if (status.includes("PENDING") || status.includes("REVIEW")) return "warning" as const;
  if (status.includes("REJECT") || status.includes("BLOCK") || status.includes("SUSPEND")) return "danger" as const;
  return "neutral" as const;
}

function initials(email?: string | null) {
  if (!email) return "V";
  const left = email.split("@")[0] ?? email;
  return (left[0] ?? "V").toUpperCase();
}

export default function AdminVendorsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getAdminVendors({ page: 1, pageSize: 100 });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load vendors",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, []);

  const vendors = useMemo(() => {
    if (state.kind !== "ready") return [];
    const query = q.trim().toLowerCase();
    if (!query) return state.data.items;

    return state.data.items.filter((vendor) =>
      JSON.stringify(vendor).toLowerCase().includes(query)
    );
  }, [state, q]);

  return (
    <PortalShell
      role="admin"
      title="Vendors"
      subtitle="Open each vendor profile as a full page"
    >
      <div className="space-y-6">
        <Toolbar
          title="Registered vendors"
          subtitle="Detail pages include agreements, property portfolio, and quick links."
          searchPlaceholder="Search vendor, email, company…"
          onSearch={setQ}
        />

        {state.kind === "loading" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonBlock key={idx} className="h-32" />
            ))}
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
            {state.message}
          </div>
        ) : vendors.length === 0 ? (
          <EmptyState
            title="No vendors found"
            description="There are no vendors matching your search filters."
            icon={<Users className="h-6 w-6" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vendors.map((vendor) => {
              const vendorId = pickVendorString(vendor, ["id"]);
              if (!vendorId) return null;

              const email = pickVendorString(vendor, ["email", "ownerEmail", "userEmail"]);
              const displayName =
                pickVendorString(vendor, ["displayName", "companyName", "name"]) ||
                "Vendor";
              const status = pickVendorString(vendor, ["status"]) || "UNKNOWN";

              return (
                <Link
                  key={vendorId}
                  href={`/admin/vendors/${encodeURIComponent(vendorId)}`}
                  className="group rounded-3xl border border-line/60 bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-warm-alt/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-accent-text">
                        {initials(email)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-primary">{displayName}</div>
                        <div className="mt-1 truncate text-xs text-secondary">{email ?? "-"}</div>
                      </div>
                    </div>

                    <StatusPill tone={toneForStatus(status)}>{status}</StatusPill>
                  </div>

                  <div className="mt-4 grid gap-1 text-xs text-secondary">
                    <div className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {email ?? "No email"}
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Open vendor detail page
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
