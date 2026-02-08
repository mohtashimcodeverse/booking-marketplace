"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { CardList, type CardListItem } from "@/components/portal/ui/CardList";
import { Modal } from "@/components/portal/ui/Modal";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { getAdminBookings } from "@/lib/api/portal/admin";

type AdminBooking = Awaited<ReturnType<typeof getAdminBookings>>["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getAdminBookings>> };

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatDate(value: unknown): string {
  const raw = readString(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
}

function formatMoney(amount: number | null, currency: string): string {
  if (amount === null) return "-";
  if (!currency) return String(amount);
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

export default function AdminBookingsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminBooking | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setState({ kind: "loading" });
      try {
        const data = await getAdminBookings({ page, pageSize: 20 });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load bookings",
        });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [page]);

  const derived = useMemo(() => {
    if (state.kind !== "ready") return null;

    const statuses = Array.from(
      new Set(state.data.items.map((item) => readString((item as Record<string, unknown>).status)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    const q = query.trim().toLowerCase();

    const filtered = state.data.items
      .filter((item) => {
        if (statusFilter === "ALL") return true;
        const status = readString((item as Record<string, unknown>).status);
        return status === statusFilter;
      })
      .filter((item) => {
        if (!q) return true;
        return JSON.stringify(item).toLowerCase().includes(q);
      });

    const totalPages = Math.max(1, Math.ceil(state.data.total / state.data.pageSize));

    return { statuses, filtered, totalPages };
  }, [query, state, statusFilter]);

  const items = useMemo<CardListItem[]>(() => {
    if (!derived) return [];

    return derived.filtered.map((booking) => {
      const row = booking as Record<string, unknown>;
      const id = readString(row.id);
      const propertyTitle =
        readString(row.propertyTitle) || readString(row.propertyName) || readString(row.propertyId) || "Property";
      const status = readString(row.status) || "UNKNOWN";
      const customer = readString(row.customerEmail) || readString(row.customerName) || "Guest";

      return {
        id: id || Math.random().toString(16),
        title: propertyTitle,
        subtitle: `${formatDate(row.checkIn)} - ${formatDate(row.checkOut)}`,
        status: <StatusPill status={status}>{status}</StatusPill>,
        meta: (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Booking: {id.slice(0, 8)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Guest: {customer}
            </span>
          </div>
        ),
        onClick: () => setSelected(booking),
      };
    });
  }, [derived]);

  return (
    <PortalShell role="admin" title="Bookings" subtitle="Platform booking operations and status visibility">
      {state.kind === "loading" ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          {state.message}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_240px]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search booking id, property, guest..."
                className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900"
              >
                <option value="ALL">All statuses</option>
                {(derived?.statuses ?? []).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <CardList
            title="Platform bookings"
            subtitle="Click a booking to open centered details"
            items={items}
            emptyTitle="No bookings"
            emptyDescription="No records match the current filters."
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {state.data.page} of {derived?.totalPages ?? 1}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={state.data.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm disabled:opacity-50"
              >
                Prev
              </button>

              <button
                type="button"
                disabled={state.data.page >= (derived?.totalPages ?? 1)}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <Modal
            open={selected !== null}
            onClose={() => setSelected(null)}
            size="lg"
            title={selected ? readString((selected as Record<string, unknown>).propertyTitle) || "Booking detail" : "Booking detail"}
            subtitle={selected ? `Booking ref: ${readString((selected as Record<string, unknown>).id)}` : undefined}
          >
            {selected ? (
              <BookingDetail booking={selected} />
            ) : null}
          </Modal>
        </div>
      )}
    </PortalShell>
  );
}

function BookingDetail(props: { booking: AdminBooking }) {
  const row = props.booking as Record<string, unknown>;
  const status = readString(row.status) || "UNKNOWN";
  const amount = readNumber(row.totalAmount) ?? readNumber(row.amount);
  const currency = readString(row.currency);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={status}>{status}</StatusPill>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Total: {formatMoney(amount, currency)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Guest" value={readString(row.customerEmail) || readString(row.customerName) || "-"} />
        <Info label="Property" value={readString(row.propertyTitle) || readString(row.propertyId) || "-"} />
        <Info label="Check-in" value={formatDate(row.checkIn)} />
        <Info label="Check-out" value={formatDate(row.checkOut)} />
        <Info label="Created" value={formatDate(row.createdAt)} />
      </div>
    </div>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#f6f3ec] p-4">
      <div className="text-xs font-semibold text-slate-500">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{props.value}</div>
    </div>
  );
}
