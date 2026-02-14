"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import {
  confirmVendorPropertyActivationManual,
  createVendorPropertyActivationInvoice,
  getVendorPropertyActivation,
  publishVendorProperty,
  type VendorPropertyActivationInvoice,
} from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      data: Awaited<ReturnType<typeof getVendorPropertyActivation>>;
    };

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function VendorPropertyActivationPage() {
  const params = useParams<{ propertyId: string }>();
  const propertyId = typeof params?.propertyId === "string" ? params.propertyId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertyId) {
      setState({ kind: "error", message: "Missing property id." });
      return;
    }

    setState({ kind: "loading" });
    try {
      const data = await getVendorPropertyActivation(propertyId);
      setState({ kind: "ready", data });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to load activation status",
      });
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function ensureInvoice() {
    setBusy("Creating invoice...");
    setMessage(null);
    try {
      await createVendorPropertyActivationInvoice(propertyId, { provider: "MANUAL" });
      await load();
      setMessage("Activation invoice created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create invoice.");
    } finally {
      setBusy(null);
    }
  }

  async function confirmManual(invoice: VendorPropertyActivationInvoice | null) {
    setBusy("Confirming payment...");
    setMessage(null);
    try {
      await confirmVendorPropertyActivationManual(propertyId, {
        invoiceId: invoice?.id,
        providerRef: "manual-dev-confirmed",
      });
      await load();
      setMessage("Activation payment confirmed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to confirm payment.");
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    setBusy("Publishing...");
    setMessage(null);
    try {
      await publishVendorProperty(propertyId);
      setMessage("Published successfully.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publish failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <PortalShell
      role="vendor"
      title="Activation Payment"
      subtitle="Complete setup retainer to unlock publishing"
      right={
        <Link
          href={`/vendor/properties/${encodeURIComponent(propertyId)}/edit`}
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to editor
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/vendor" className="hover:text-primary">Portal Home</Link>
          <span className="mx-2">/</span>
          <Link href="/vendor/properties" className="hover:text-primary">Properties</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Activation</span>
        </div>

        {state.kind === "loading" ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-40" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-5 text-sm text-danger">{state.message}</div>
        ) : (
          <>
            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-primary">Current listing status</div>
                  <div className="mt-1 text-xs text-secondary">Publishing is blocked until activation payment is confirmed.</div>
                </div>
                <StatusPill status={state.data.propertyStatus}>{state.data.propertyStatus}</StatusPill>
              </div>
            </section>

            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="text-sm font-semibold text-primary">Activation invoice</div>
              {state.data.invoice ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Info label="Invoice" value={state.data.invoice.id} mono />
                  <Info label="Amount" value={formatMoney(state.data.invoice.amount, state.data.invoice.currency)} />
                  <Info label="Status" value={state.data.invoice.status} />
                  <Info label="Created" value={fmtDate(state.data.invoice.createdAt)} />
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                  No activation invoice found yet.
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!state.data.invoice ? (
                  <button
                    type="button"
                    onClick={() => void ensureInvoice()}
                    disabled={busy !== null}
                    className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
                  >
                    Create invoice
                  </button>
                ) : state.data.invoice.status !== "PAID" ? (
                  <button
                    type="button"
                    onClick={() => void confirmManual(state.data.invoice)}
                    disabled={busy !== null}
                    className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
                  >
                    Confirm manual payment
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void publish()}
                    disabled={busy !== null || state.data.propertyStatus !== "APPROVED"}
                    className="rounded-xl bg-success px-4 py-2 text-sm font-semibold text-inverted hover:bg-success disabled:opacity-60"
                  >
                    Publish listing
                  </button>
                )}
              </div>

              {busy ? <div className="mt-3 text-xs font-semibold text-secondary">{busy}</div> : null}
              {message ? (
                <div className="mt-3 rounded-2xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">
                  {message}
                </div>
              ) : null}
            </section>
          </>
        )}
      </div>
    </PortalShell>
  );
}

function Info(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-4">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className={`mt-1 text-sm font-semibold text-primary ${props.mono ? "font-mono text-xs" : ""}`}>
        {props.value}
      </div>
    </div>
  );
}
