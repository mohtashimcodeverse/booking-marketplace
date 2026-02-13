"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import { getAdminVendorDetail, type AdminVendorDetailResponse } from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminVendorDetailResponse };

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function AdminVendorDetailPage() {
  const params = useParams<{ vendorId: string }>();
  const vendorId = typeof params?.vendorId === "string" ? params.vendorId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!vendorId) return;
      setState({ kind: "loading" });
      try {
        const data = await getAdminVendorDetail(vendorId);
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load vendor detail",
        });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [vendorId]);

  return (
    <PortalShell
      role="admin"
      title="Vendor Detail"
      subtitle="Profile, service agreements, and property portfolio"
      right={(
        <Link
          href="/admin/vendors"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to vendors
        </Link>
      )}
    >
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  {state.data.displayName || state.data.user.fullName || state.data.user.email}
                </h2>
                <div className="mt-1 text-sm text-secondary">{state.data.user.email}</div>
              </div>
              <StatusPill status={state.data.status}>{state.data.status}</StatusPill>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Joined" value={formatDate(state.data.createdAt)} />
              <Info label="Properties" value={String(state.data.propertyCount)} />
              <Info label="Bookings" value={String(state.data.bookingsTotal)} />
              <Info label="Open ops tasks" value={String(state.data.opsTasksOpen)} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/admin/bookings"
                className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
              >
                Vendor bookings
              </Link>
              <Link
                href="/admin/ops-tasks"
                className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
              >
                Vendor ops summary
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Service agreements</div>
            {state.data.agreements.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                No service agreement records yet.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {state.data.agreements.map((agreement) => (
                  <div key={agreement.id} className="rounded-2xl border border-line/70 bg-warm-base p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-primary">
                        {agreement.servicePlan.name} ({agreement.servicePlan.type})
                      </div>
                      <StatusPill status={agreement.status}>{agreement.status}</StatusPill>
                    </div>
                    <div className="mt-1 text-xs text-secondary">
                      {formatDate(agreement.startDate)} - {formatDate(agreement.endDate)} · Fee {agreement.agreedManagementFeeBps} bps
                    </div>
                    {agreement.notes ? (
                      <div className="mt-2 rounded-xl border border-line/70 bg-surface p-2 text-xs text-secondary">
                        {agreement.notes}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Properties</div>
            {state.data.properties.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                This vendor has no properties.
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {state.data.properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/admin/properties/${encodeURIComponent(property.id)}`}
                    className="rounded-2xl border border-line/70 bg-warm-base p-3 transition hover:bg-accent-soft/45"
                  >
                    <div className="text-sm font-semibold text-primary">{property.title}</div>
                    <div className="mt-1 text-xs text-secondary">
                      {[property.area, property.city].filter(Boolean).join(", ")}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <StatusPill status={property.status}>{property.status}</StatusPill>
                      <span className="font-semibold text-secondary">Bookings: {property.bookingsCount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PortalShell>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-3">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-primary">{props.value}</div>
    </div>
  );
}
