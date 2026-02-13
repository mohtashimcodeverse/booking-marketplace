"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import { getAdminRefundDetail, type AdminRefundDetailResponse } from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminRefundDetailResponse };

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export default function AdminRefundDetailPage() {
  const params = useParams<{ refundId: string }>();
  const refundId = typeof params?.refundId === "string" ? params.refundId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!refundId) return;
      setState({ kind: "loading" });
      try {
        const data = await getAdminRefundDetail(refundId);
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load refund detail",
        });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [refundId]);

  return (
    <PortalShell
      role="admin"
      title="Refund Detail"
      subtitle="Execution state, provider references, and cancellation audit"
      right={(
        <Link
          href="/admin/refunds"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to refunds
        </Link>
      )}
    >
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-44" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">Refund {state.data.id}</h2>
                <div className="mt-1 text-sm text-secondary">
                  Booking {state.data.booking.id} · Provider {state.data.provider}
                </div>
              </div>
              <StatusPill status={state.data.status}>{state.data.status}</StatusPill>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Amount" value={formatMoney(state.data.amount, state.data.currency)} />
              <Info label="Reason" value={state.data.reason} />
              <Info label="Provider ref" value={state.data.providerRefundRef || "-"} />
              <Info label="Idempotency" value={state.data.idempotencyKey || "-"} />
              <Info label="Created" value={formatDate(state.data.createdAt)} />
              <Info label="Updated" value={formatDate(state.data.updatedAt)} />
            </div>
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Booking context</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Property" value={state.data.booking.property.title} />
              <Info label="Guest" value={state.data.booking.customer.fullName || state.data.booking.customer.email} />
              <Info label="Check-in" value={formatDate(state.data.booking.checkIn)} />
              <Info label="Check-out" value={formatDate(state.data.booking.checkOut)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/admin/bookings/${encodeURIComponent(state.data.booking.id)}`}
                className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
              >
                Open booking detail
              </Link>
              {state.data.payment ? (
                <Link
                  href={`/admin/payments/${encodeURIComponent(state.data.payment.id)}`}
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Open payment detail
                </Link>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Cancellation audit</div>
            {state.data.bookingCancellation ? (
              <div className="mt-3 rounded-2xl border border-line/70 bg-warm-base p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={state.data.bookingCancellation.reason}>
                    {state.data.bookingCancellation.reason}
                  </StatusPill>
                  <span className="text-xs text-secondary">{state.data.bookingCancellation.actor}</span>
                </div>
                <div className="mt-2 text-xs text-secondary">
                  Mode {state.data.bookingCancellation.mode} · {formatDate(state.data.bookingCancellation.cancelledAt)}
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Info
                    label="Penalty"
                    value={formatMoney(
                      state.data.bookingCancellation.penaltyAmount,
                      state.data.bookingCancellation.currency
                    )}
                  />
                  <Info
                    label="Refundable"
                    value={formatMoney(
                      state.data.bookingCancellation.refundableAmount,
                      state.data.bookingCancellation.currency
                    )}
                  />
                </div>
                {state.data.bookingCancellation.notes ? (
                  <div className="mt-2 rounded-xl border border-line/70 bg-surface p-2 text-xs text-secondary">
                    {state.data.bookingCancellation.notes}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                No cancellation record linked to this refund.
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
