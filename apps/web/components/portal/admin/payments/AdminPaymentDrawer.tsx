"use client";

import { useMemo, useState } from "react";
import { X, Hash, CreditCard, CalendarDays, Link as LinkIcon, Banknote, Info, Copy } from "lucide-react";
import { StatusPill } from "@/components/portal/ui/StatusPill";

type Tone = "neutral" | "success" | "warning" | "danger";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getString(obj: unknown, key: string): string | null {
  const rec = asRecord(obj);
  if (!rec) return null;
  const v = rec[key];
  return typeof v === "string" ? v : null;
}

function getNumber(obj: unknown, key: string): number | null {
  const rec = asRecord(obj);
  if (!rec) return null;
  const v = rec[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function pickString(obj: unknown, keys: string[]): string | null {
  for (const k of keys) {
    const v = getString(obj, k);
    if (v && v.trim().length) return v.trim();
  }
  return null;
}

function pickNumber(obj: unknown, keys: string[]): number | null {
  for (const k of keys) {
    const v = getNumber(obj, k);
    if (v !== null) return v;
  }
  return null;
}

function safeText(v: string | null | undefined): string {
  const t = (v ?? "").trim();
  return t.length ? t : "—";
}

function fmtDate(iso: string | null | undefined): string {
  const t = (iso ?? "").trim();
  if (!t) return "—";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleString();
}

function fmtMoney(amount: number | null, currency: string | null): string {
  if (amount === null) return "—";
  const cur = (currency ?? "").trim();
  const pretty = amount.toLocaleString();
  return cur ? `${pretty} ${cur}` : pretty;
}

function toneForStatus(s: string): Tone {
  const v = s.toUpperCase();
  if (v.includes("CAPTURE") || v.includes("PAID") || v.includes("SUCCEED")) return "success";
  if (v.includes("FAIL") || v.includes("CANCEL") || v.includes("REFUND_FAIL")) return "danger";
  if (v.includes("PENDING") || v.includes("AUTHOR") || v.includes("REQUIRES")) return "warning";
  return "neutral";
}

function KeyValue(props: { icon?: React.ReactNode; label: string; value: string; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          {props.icon ? <span className="text-muted">{props.icon}</span> : null}
          <span>{props.label}</span>
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>
      <div className="mt-1 text-sm font-semibold text-primary break-words">{props.value}</div>
    </div>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function AdminPaymentDrawer(props: {
  open: boolean;
  onClose: () => void;
  payment: Record<string, unknown>;
}) {
  const p = props.payment;

  const id = useMemo(() => pickString(p, ["id", "paymentId", "reference", "providerRef"]) ?? "—", [p]);
  const status = useMemo(() => pickString(p, ["status", "state"]) ?? "—", [p]);
  const provider = useMemo(() => pickString(p, ["provider", "gateway"]) ?? "—", [p]);
  const bookingId = useMemo(() => pickString(p, ["bookingId", "bookingID"]) ?? "—", [p]);
  const providerRef = useMemo(
    () => pickString(p, ["providerRef", "providerReference", "orderRef", "paymentIntentId", "chargeId"]) ?? "—",
    [p],
  );

  const currency = useMemo(() => pickString(p, ["currency"]) ?? null, [p]);

  const amount = useMemo(
    () =>
      pickNumber(p, ["amountCaptured", "amount", "amountTotal"]) ??
      pickNumber(p, ["amountAuthorized", "authorizedAmount"]) ??
      null,
    [p],
  );

  const createdAt = useMemo(() => pickString(p, ["createdAt", "created", "created_at"]) ?? null, [p]);
  const updatedAt = useMemo(() => pickString(p, ["updatedAt", "updated", "updated_at"]) ?? null, [p]);

  const [copied, setCopied] = useState<string | null>(null);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={props.onClose}
        className="absolute inset-0 bg-dark-1/40"
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-surface shadow-2xl">
        <div className="border-b p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-lg font-semibold text-primary truncate">Payment</div>
                <StatusPill tone={toneForStatus(status)}>{status}</StatusPill>
                <div className="rounded-full bg-warm-alt px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-line">
                  {provider}
                </div>
              </div>
              <div className="mt-1 text-xs font-mono text-muted break-all">{id}</div>
            </div>

            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-surface hover:bg-warm-alt"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border bg-warm-alt p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-muted">Booking</div>
                <div className="mt-1 text-sm font-semibold text-primary break-all">{safeText(bookingId)}</div>
                <div className="mt-1 text-xs text-muted">Provider Ref</div>
                <div className="mt-1 text-xs font-mono text-muted break-all">{safeText(providerRef)}</div>
              </div>

              <div className="shrink-0">
                <div className="rounded-2xl bg-surface px-4 py-3 ring-1 ring-line">
                  <div className="text-[11px] font-semibold text-muted">Amount</div>
                  <div className="mt-1 text-sm font-semibold text-primary">{fmtMoney(amount, currency)}</div>
                </div>
              </div>
            </div>

            {copied ? (
              <div className="mt-3 text-xs font-semibold text-success">
                Copied {copied} ✓
              </div>
            ) : null}
          </div>
        </div>

        <div className="h-[calc(100%-132px)] overflow-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <KeyValue
              icon={<Hash className="h-4 w-4" />}
              label="Payment ID"
              value={safeText(id)}
              right={
                id !== "—" ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(id);
                      setCopied(ok ? "Payment ID" : null);
                      window.setTimeout(() => setCopied(null), 1200);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border bg-surface px-2 py-1 text-[11px] font-semibold text-secondary hover:bg-warm-alt"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                ) : null
              }
            />

            <KeyValue icon={<CreditCard className="h-4 w-4" />} label="Status" value={safeText(status)} />
            <KeyValue icon={<LinkIcon className="h-4 w-4" />} label="Booking" value={safeText(bookingId)} />
            <KeyValue icon={<Banknote className="h-4 w-4" />} label="Amount" value={fmtMoney(amount, currency)} />

            <KeyValue icon={<Info className="h-4 w-4" />} label="Provider" value={safeText(provider)} />
            <KeyValue
              icon={<Hash className="h-4 w-4" />}
              label="Provider Ref"
              value={safeText(providerRef)}
              right={
                providerRef !== "—" ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(providerRef);
                      setCopied(ok ? "Provider Ref" : null);
                      window.setTimeout(() => setCopied(null), 1200);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border bg-surface px-2 py-1 text-[11px] font-semibold text-secondary hover:bg-warm-alt"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                ) : null
              }
            />

            <KeyValue icon={<CalendarDays className="h-4 w-4" />} label="Created" value={fmtDate(createdAt)} />
            <KeyValue icon={<CalendarDays className="h-4 w-4" />} label="Updated" value={fmtDate(updatedAt)} />
          </div>

        </div>
      </div>
    </div>
  );
}
