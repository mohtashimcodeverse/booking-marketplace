"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import { getAdminPaymentDetail, type AdminPaymentDetailResponse } from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminPaymentDetailResponse };

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export default function AdminPaymentDetailPage() {
  const params = useParams<{ paymentId: string }>();
  const paymentId = typeof params?.paymentId === "string" ? params.paymentId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!paymentId) return;
      setState({ kind: "loading" });
      try {
        const data = await getAdminPaymentDetail(paymentId);
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load payment detail",
        });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [paymentId]);

  return (
    <PortalShell
      role="admin"
      title="Payment Detail"
      subtitle="Provider events, booking context, and refund trail"
      right={(
        <Link
          href="/admin/payments"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to payments
        </Link>
      )}
    >
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-48" />
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
                <h2 className="text-lg font-semibold text-primary">Payment {state.data.id}</h2>
                <div className="mt-1 text-sm text-secondary">
                  Booking {state.data.booking.id} · {state.data.provider}
                </div>
              </div>
              <StatusPill status={state.data.status}>{state.data.status}</StatusPill>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Amount" value={formatMoney(state.data.amount, state.data.currency)} />
              <Info label="Provider ref" value={state.data.providerRef || "-"} />
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
            <div className="mt-3">
              <Link
                href={`/admin/bookings/${encodeURIComponent(state.data.booking.id)}`}
                className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
              >
                Open booking detail
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Payment events</div>
            {state.data.events.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                No payment events logged.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {state.data.events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-line/70 bg-warm-base p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-primary">{event.label}</div>
                      <div className="text-xs text-secondary">{formatDate(event.createdAt)}</div>
                    </div>
                    <div className="mt-1 text-xs text-secondary">
                      Provider ref: {event.providerRef || "-"} · Idempotency: {event.idempotencyKey || "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Refunds linked to this payment</div>
            {state.data.refunds.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                No refunds linked to this payment.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {state.data.refunds.map((refund) => (
                  <Link
                    key={refund.id}
                    href={`/admin/refunds/${encodeURIComponent(refund.id)}`}
                    className="block rounded-2xl border border-line/70 bg-warm-base p-3 transition hover:bg-accent-soft/45"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusPill status={refund.status}>{refund.status}</StatusPill>
                      <div className="text-xs font-semibold text-secondary">
                        {formatMoney(refund.amount, refund.currency)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-secondary">
                      {refund.reason} · Provider: {refund.provider} · Ref: {refund.providerRefundRef || "-"}
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
