"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Mail, Building2, CalendarDays } from "lucide-react";

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

function initials(email?: string | null) {
  if (!email) return "V";
  const left = email.split("@")[0] ?? email;
  const parts = left.split(/[._-]/).filter(Boolean);
  return (parts[0]?.[0] ?? "V").toUpperCase();
}

function toneForStatus(status?: string | null) {
  if (!status) return "neutral";
  if (status.includes("APPROV") || status.includes("ACTIVE")) return "success";
  if (status.includes("PENDING") || status.includes("REVIEW")) return "warning";
  if (status.includes("REJECT") || status.includes("BLOCK") || status.includes("SUSPEND")) return "danger";
  return "neutral";
}

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function pickVendorValue(vendor: VendorRow, keys: ReadonlyArray<string>): unknown {
  for (const key of keys) {
    const val = vendor[key];
    if (val !== undefined && val !== null) return val;
  }
  return null;
}

function pickVendorString(vendor: VendorRow, keys: ReadonlyArray<string>): string | null {
  const val = pickVendorValue(vendor, keys);
  if (typeof val !== "string") return null;
  const s = val.trim();
  return s.length > 0 ? s : null;
}

function VendorDrawer(props: {
  vendor: VendorRow;
  onClose: () => void;
}) {
  const email = pickVendorString(props.vendor, ["email", "ownerEmail", "userEmail"]);
  const company = pickVendorString(props.vendor, ["companyName", "displayName", "name"]) ?? "—";
  const status = pickVendorString(props.vendor, ["status"]) ?? "UNKNOWN";
  const createdAt = pickVendorString(props.vendor, ["createdAt"]);
  const vendorId = pickVendorString(props.vendor, ["id"]) ?? "—";

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl">
        <div className="border-b border-black/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                Vendor details
              </div>
              <div className="mt-1 text-xs text-slate-500">
                ID: {vendorId}
              </div>
            </div>
            <button
              onClick={props.onClose}
              className="rounded-2xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-72px)] overflow-auto p-5 space-y-5">
          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-lg font-bold text-white">
                {initials(email)}
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">
                  {company}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {email ?? "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill tone={toneForStatus(status)}>
                {status}
              </StatusPill>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Building2 className="h-4 w-4" />
                Company
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {company}
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <CalendarDays className="h-4 w-4" />
                Joined
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {fmtDate(createdAt)}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Coming next
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Properties count, bookings, payouts, and compliance actions will
              appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<VendorRow | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const data = await getAdminVendors({ page: 1, pageSize: 50 });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (e) {
        if (!alive) return;
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : "Failed to load vendors",
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
    const qq = q.trim().toLowerCase();
    if (!qq) return state.data.items ?? [];
    return (state.data.items ?? []).filter((v) =>
      JSON.stringify(v).toLowerCase().includes(qq),
    );
  }, [state, q]);

  return (
    <PortalShell
      role="admin"
      title="Vendors"
      subtitle="Manage partners, review status, and access vendor profiles."
    >
      <div className="space-y-6">
        <Toolbar
          title="Registered vendors"
          subtitle="Click a vendor to view profile and status."
          searchPlaceholder="Search vendor, email, company…"
          onSearch={setQ}
        />

        {state.kind === "loading" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-28" />
            ))}
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            {state.message}
          </div>
        ) : vendors.length === 0 ? (
          <EmptyState
            title="No vendors found"
            description="There are no vendors matching your search."
            icon={<Users className="h-6 w-6" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v) => {
              const email = pickVendorString(v, ["email", "ownerEmail", "userEmail"]);
              const company = pickVendorString(v, ["companyName", "displayName", "name"]) ?? "—";
              const status = pickVendorString(v, ["status"]) ?? "UNKNOWN";
              const vendorId = pickVendorString(v, ["id"]) ?? company;

              return (
                <button
                  key={vendorId}
                  onClick={() => setSelected(v)}
                  className="text-left rounded-3xl border border-black/5 bg-white p-5 shadow-sm hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                        {initials(email)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {company}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 truncate">
                          {email ?? "—"}
                        </div>
                      </div>
                    </div>

                    <StatusPill tone={toneForStatus(status)}>
                      {status}
                    </StatusPill>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      Company
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selected ? (
          <VendorDrawer vendor={selected} onClose={() => setSelected(null)} />
        ) : null}
      </div>
    </PortalShell>
  );
}
