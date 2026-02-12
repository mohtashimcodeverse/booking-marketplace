"use client";

import { useMemo } from "react";
import { X, CalendarDays, CreditCard, Home, Mail, User, Hash, Info } from "lucide-react";
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

function fmtMoney(amountMinorOrMajor: number | null, currency: string | null): string {
  if (amountMinorOrMajor === null) return "—";
  const cur = (currency ?? "").trim();
  // We don’t know if backend returns minor units; show raw value but formatted nicely.
  const n = amountMinorOrMajor;
  const pretty = Number.isFinite(n) ? n.toLocaleString() : String(n);
  return cur ? `${pretty} ${cur}` : pretty;
}

function toneForStatus(s: string): Tone {
  const v = s.toUpperCase();
  if (v.includes("CONFIRM") || v.includes("ACTIVE") || v.includes("COMPLET")) return "success";
  if (v.includes("CANCEL") || v.includes("FAIL") || v.includes("REJECT")) return "danger";
  if (v.includes("PENDING") || v.includes("HOLD") || v.includes("REVIEW")) return "warning";
  return "neutral";
}

function KeyValue(props: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-surface p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        {props.icon ? <span className="text-muted">{props.icon}</span> : null}
        <span>{props.label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-primary break-words">{props.value}</div>
    </div>
  );
}

export function AdminBookingDrawer(props: {
  open: boolean;
  onClose: () => void;
  booking: Record<string, unknown>;
}) {
  const b = props.booking;

  const id = useMemo(() => pickString(b, ["id", "bookingId", "code", "reference"]) ?? "—", [b]);

  const status = useMemo(
    () => pickString(b, ["status", "bookingStatus", "state"]) ?? "—",
    [b],
  );

  const propertyTitle = useMemo(
    () =>
      pickString(b, ["propertyTitle", "listingTitle", "propertyName", "title"]) ??
      pickString(b, ["propertySlug", "slug"]) ??
      "—",
    [b],
  );

  const propertyId = useMemo(() => pickString(b, ["propertyId", "listingId", "propertyID"]) ?? "—", [b]);

  const guestEmail = useMemo(
    () =>
      pickString(b, ["customerEmail", "guestEmail", "userEmail", "email"]) ??
      pickString(b, ["customerId", "userId", "guestId"]) ??
      "—",
    [b],
  );

  const guestName = useMemo(
    () => pickString(b, ["customerName", "guestName", "userName", "name"]) ?? "—",
    [b],
  );

  const checkIn = useMemo(
    () => pickString(b, ["checkIn", "startDate", "from", "dateFrom"]) ?? null,
    [b],
  );

  const checkOut = useMemo(
    () => pickString(b, ["checkOut", "endDate", "to", "dateTo"]) ?? null,
    [b],
  );

  const currency = useMemo(
    () => pickString(b, ["currency", "cur"]) ?? null,
    [b],
  );

  const total = useMemo(
    () =>
      pickNumber(b, ["totalAmount", "total", "amountTotal", "grandTotal", "priceTotal"]) ??
      pickNumber(b, ["amount", "subtotal", "baseAmount"]) ??
      null,
    [b],
  );

  const createdAt = useMemo(() => pickString(b, ["createdAt", "created", "created_at"]) ?? null, [b]);
  const updatedAt = useMemo(() => pickString(b, ["updatedAt", "updated", "updated_at"]) ?? null, [b]);

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
                <div className="text-lg font-semibold text-primary truncate">Booking</div>
                <StatusPill tone={toneForStatus(status)} className="capitalize">
                  {status}
                </StatusPill>
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
                <div className="text-xs font-semibold text-muted">Property</div>
                <div className="mt-1 text-sm font-semibold text-primary truncate">{safeText(propertyTitle)}</div>
                <div className="mt-1 text-xs font-mono text-muted break-all">{safeText(propertyId)}</div>
              </div>

              <div className="shrink-0">
                <div className="rounded-2xl bg-surface px-4 py-3 ring-1 ring-line">
                  <div className="text-[11px] font-semibold text-muted">Total</div>
                  <div className="mt-1 text-sm font-semibold text-primary">{fmtMoney(total, currency)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-132px)] overflow-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <KeyValue icon={<User className="h-4 w-4" />} label="Guest name" value={safeText(guestName)} />
            <KeyValue icon={<Mail className="h-4 w-4" />} label="Guest" value={safeText(guestEmail)} />
            <KeyValue icon={<Home className="h-4 w-4" />} label="Property ID" value={safeText(propertyId)} />
            <KeyValue icon={<Hash className="h-4 w-4" />} label="Booking ID" value={safeText(id)} />
            <KeyValue icon={<CalendarDays className="h-4 w-4" />} label="Check-in" value={fmtDate(checkIn)} />
            <KeyValue icon={<CalendarDays className="h-4 w-4" />} label="Check-out" value={fmtDate(checkOut)} />
            <KeyValue icon={<CreditCard className="h-4 w-4" />} label="Total" value={fmtMoney(total, currency)} />
            <KeyValue icon={<Info className="h-4 w-4" />} label="Created" value={fmtDate(createdAt)} />
          </div>

          <div className="mt-4 rounded-2xl border bg-surface p-4">
            <div className="text-sm font-semibold text-primary">Timestamps</div>
            <div className="mt-3 grid gap-2 text-sm text-secondary">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Created</span>
                <span className="font-semibold text-primary">{fmtDate(createdAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Updated</span>
                <span className="font-semibold text-primary">{fmtDate(updatedAt)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
