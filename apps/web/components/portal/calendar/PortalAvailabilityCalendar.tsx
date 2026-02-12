"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarCheck2, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  PortalCalendarEvent,
  PortalCalendarResponse,
} from "@/lib/api/portal/calendar";
import { Modal } from "@/components/portal/ui/Modal";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

type RoleView = "vendor" | "admin" | "customer";

type DateRange = {
  from: Date | null;
  to: Date | null;
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function startOfDay(value: Date): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    0,
    0,
    0,
    0,
  );
}

function toIsoDay(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

function eventOverlapsRange(event: PortalCalendarEvent, from: Date, toExclusive: Date): boolean {
  const eventStart = parseISO(event.start);
  const eventEnd = parseISO(event.end);
  return eventStart < toExclusive && eventEnd > from;
}

function classifyDay(events: PortalCalendarEvent[], day: Date): "booked" | "blocked" | "held" | "available" {
  const from = startOfDay(day);
  const toExclusive = addDays(from, 1);
  const daily = events.filter((event) => eventOverlapsRange(event, from, toExclusive));

  if (daily.some((event) => event.type === "BOOKING")) return "booked";
  if (daily.some((event) => event.type === "BLOCKED")) return "blocked";
  if (daily.some((event) => event.type === "HOLD")) return "held";
  return "available";
}

function statusTone(event: PortalCalendarEvent): "success" | "warning" | "danger" | "neutral" {
  if (event.type === "BOOKING") {
    const value = event.status.toUpperCase();
    if (value.includes("CONFIRM") || value.includes("COMPLETE")) return "success";
    if (value.includes("PENDING") || value.includes("HOLD")) return "warning";
    if (value.includes("CANCEL") || value.includes("FAILED")) return "danger";
    return "neutral";
  }

  if (event.type === "BLOCKED") return "danger";
  if (event.type === "HOLD") return "warning";
  return "neutral";
}

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount === null || !currency) return "-";
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

function rangeLabel(range: DateRange): string {
  const from = range.from;
  const to = range.to ?? range.from;
  if (!from || !to) return "No date selected";
  if (isSameDay(from, to)) return format(from, "MMM d, yyyy");
  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
}

function dayCellTone(tone: "booked" | "blocked" | "held" | "available", selected: boolean): string {
  if (tone === "booked") {
    return selected
      ? "bg-brand text-accent-text ring-brand"
      : "bg-brand/12 text-primary ring-brand/30 hover:bg-brand/20";
  }
  if (tone === "blocked") {
    return selected
      ? "bg-danger text-inverted ring-danger/70"
      : "bg-danger/12 text-danger ring-danger/30 hover:bg-danger/12";
  }
  if (tone === "held") {
    return selected
      ? "bg-warning text-inverted ring-warning/70"
      : "bg-warning/12 text-warning ring-warning/30 hover:bg-warning/12";
  }
  return selected
    ? "bg-brand text-accent-text ring-brand"
    : "bg-surface text-primary ring-line/70 hover:bg-warm-alt";
}

function roleIntro(role: RoleView): string {
  if (role === "vendor") return "Your property is booked on highlighted dates. Use this to plan operations.";
  if (role === "admin") return "Inspect booking blocks across platform properties with full operational visibility.";
  return "Read-only availability view to help booking decisions before checkout.";
}

export function PortalAvailabilityCalendar(props: {
  role: RoleView;
  loadData: (params: {
    from: string;
    to: string;
    propertyId?: string;
  }) => Promise<PortalCalendarResponse>;
  allowBlockControls?: boolean;
  onBlockRange?: (params: {
    propertyId: string;
    from: string;
    to: string;
    note?: string;
  }) => Promise<{ ok: true } | { ok: true; blockedDays: number }>;
  onUnblockRange?: (params: {
    propertyId: string;
    from: string;
    to: string;
    note?: string;
  }) => Promise<{ ok: true } | { ok: true; unblockedDays: number }>;
}) {
  const { loadData, role } = props;
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [rangeFrom, setRangeFrom] = useState<string>("");
  const [rangeTo, setRangeTo] = useState<string>("");
  const [rangeNote, setRangeNote] = useState<string>("");
  const [rangeBusy, setRangeBusy] = useState<string | null>(null);
  const [rangeMessage, setRangeMessage] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; data: PortalCalendarResponse }
  >({ kind: "loading" });

  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [openDetails, setOpenDetails] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setState({ kind: "loading" });
      try {
        const from = toIsoDay(startOfMonth(month));
        const to = toIsoDay(addMonths(startOfMonth(month), 1));

        const data = await loadData({
          from,
          to,
          propertyId: selectedPropertyId ?? undefined,
        });

        if (!alive) return;
        setState({ kind: "ready", data });

        if (!selectedPropertyId && data.selectedPropertyId) {
          setSelectedPropertyId(data.selectedPropertyId);
        }
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load calendar",
        });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [loadData, month, refreshTick, selectedPropertyId]);

  useEffect(() => {
    const from = toIsoDay(startOfMonth(month));
    const to = toIsoDay(addDays(startOfMonth(month), 1));
    setRangeFrom(from);
    setRangeTo(to);
  }, [month]);

  const data = state.kind === "ready" ? state.data : null;
  const events = useMemo(() => data?.events ?? [], [data]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

    const days: Date[] = [];
    for (let day = start; day <= end; day = addDays(day, 1)) {
      days.push(day);
    }
    return days;
  }, [month]);

  const activeRange = useMemo(() => {
    if (!range.from) return null;
    const from = startOfDay(range.from);
    const to = startOfDay(range.to ?? range.from);
    const start = isAfter(from, to) ? to : from;
    const end = isAfter(from, to) ? from : to;
    return { from: start, to: end };
  }, [range.from, range.to]);

  const detailEvents = useMemo(() => {
    if (!activeRange) return [];

    const toExclusive = addDays(activeRange.to, 1);
    return events.filter((event) => eventOverlapsRange(event, activeRange.from, toExclusive));
  }, [activeRange, events]);

  function pickDay(day: Date) {
    setRange((current) => {
      if (!current.from || current.to) {
        return { from: day, to: null };
      }

      if (isBefore(day, current.from)) {
        return { from: day, to: current.from };
      }

      if (isSameDay(day, current.from)) {
        return { from: day, to: day };
      }

      return { from: current.from, to: day };
    });
    setOpenDetails(true);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-line/50 bg-warm-base/70 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">Monthly availability</div>
            <div className="mt-1 text-sm text-secondary">{roleIntro(role)}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth((previous) => addMonths(previous, -1))}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <div className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              {format(month, "MMMM yyyy")}
            </div>

            <button
              type="button"
              onClick={() => setMonth((previous) => addMonths(previous, 1))}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="flex items-center gap-3 rounded-2xl border border-line/80 bg-surface px-4 py-3">
            <span className="text-xs font-semibold tracking-wide text-muted">PROPERTY</span>
            <select
              value={selectedPropertyId ?? data?.selectedPropertyId ?? ""}
              onChange={(event) => setSelectedPropertyId(event.target.value || null)}
              className="w-full bg-transparent text-sm font-semibold text-primary outline-none"
              disabled={!data || data.properties.length === 0}
            >
              {(data?.properties ?? []).map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                  {property.city ? ` (${property.city})` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 ring-1 ring-line/90">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Booked
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 ring-1 ring-line/90">
              <span className="h-2.5 w-2.5 rounded-full bg-warning/36" /> Hold / unavailable
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 ring-1 ring-line/90">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Blocked
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 ring-1 ring-line/90">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-soft" /> Available
            </span>
          </div>
        </div>

        {props.allowBlockControls && role === "vendor" ? (
          <div className="mt-4 rounded-2xl border border-line/80 bg-surface p-3">
            <div className="text-sm font-semibold text-primary">Owner-use date controls</div>
            <div className="mt-1 text-xs text-secondary">
              Block or unblock dates for owner-use. End date is checkout-style (exclusive).
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_2fr_auto_auto]">
              <input
                type="date"
                value={rangeFrom}
                onChange={(event) => setRangeFrom(event.target.value)}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
              />
              <input
                type="date"
                value={rangeTo}
                onChange={(event) => setRangeTo(event.target.value)}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
              />
              <input
                value={rangeNote}
                onChange={(event) => setRangeNote(event.target.value)}
                placeholder="Note (optional)"
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
              />
              <button
                type="button"
                disabled={!selectedPropertyId || !rangeFrom || !rangeTo || rangeBusy !== null}
                onClick={async () => {
                  if (!props.onBlockRange || !selectedPropertyId) return;
                  setRangeError(null);
                  setRangeMessage(null);
                  setRangeBusy("Blocking...");
                  try {
                    await props.onBlockRange({
                      propertyId: selectedPropertyId,
                      from: rangeFrom,
                      to: rangeTo,
                      note: rangeNote.trim() || undefined,
                    });
                    setRangeMessage("Dates blocked successfully.");
                    setRefreshTick((value) => value + 1);
                  } catch (error) {
                    setRangeError(
                      error instanceof Error ? error.message : "Failed to block dates",
                    );
                  } finally {
                    setRangeBusy(null);
                  }
                }}
                className="rounded-xl bg-danger px-3 py-2 text-sm font-semibold text-inverted hover:bg-danger disabled:opacity-60"
              >
                Block
              </button>
              <button
                type="button"
                disabled={!selectedPropertyId || !rangeFrom || !rangeTo || rangeBusy !== null}
                onClick={async () => {
                  if (!props.onUnblockRange || !selectedPropertyId) return;
                  setRangeError(null);
                  setRangeMessage(null);
                  setRangeBusy("Unblocking...");
                  try {
                    await props.onUnblockRange({
                      propertyId: selectedPropertyId,
                      from: rangeFrom,
                      to: rangeTo,
                      note: rangeNote.trim() || undefined,
                    });
                    setRangeMessage("Dates unblocked successfully.");
                    setRefreshTick((value) => value + 1);
                  } catch (error) {
                    setRangeError(
                      error instanceof Error ? error.message : "Failed to unblock dates",
                    );
                  } finally {
                    setRangeBusy(null);
                  }
                }}
                className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
              >
                Unblock
              </button>
            </div>
            {rangeBusy ? (
              <div className="mt-2 text-xs font-semibold text-secondary">{rangeBusy}</div>
            ) : null}
            {rangeMessage ? (
              <div className="mt-2 rounded-xl border border-success/30 bg-success/12 p-2 text-xs text-success">
                {rangeMessage}
              </div>
            ) : null}
            {rangeError ? (
              <div className="mt-2 rounded-xl border border-danger/30 bg-danger/12 p-2 text-xs text-danger">
                {rangeError}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {state.kind === "loading" ? (
        <div className="grid gap-3">
          <SkeletonBlock className="h-14" />
          <SkeletonBlock className="h-[420px]" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold tracking-wide text-muted">
            {[
              "MON",
              "TUE",
              "WED",
              "THU",
              "FRI",
              "SAT",
              "SUN",
            ].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {gridDays.map((day) => {
              const tone = classifyDay(events, day);
              const selected = Boolean(
                activeRange &&
                  !isBefore(day, activeRange.from) &&
                  !isAfter(day, activeRange.to),
              );

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={cn(
                    "h-20 rounded-2xl p-2 text-left ring-1 transition",
                    dayCellTone(tone, selected),
                    !isSameMonth(day, month) && "opacity-45",
                  )}
                >
                  <div className="text-xs font-semibold">{format(day, "d")}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        title="Availability details"
        subtitle={rangeLabel(range)}
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-line/80 bg-warm-base p-4 text-sm text-secondary">
            <div className="font-semibold text-primary">{rangeLabel(range)}</div>
            <div className="mt-1">
              {(data?.properties ?? []).find((property) => property.id === (selectedPropertyId ?? data?.selectedPropertyId ?? ""))?.title ??
                "Selected property"}
            </div>
          </div>

          {detailEvents.length === 0 ? (
            <div className="rounded-2xl border border-success/30 bg-success/12 p-4 text-sm text-success">
              <div className="font-semibold">Available</div>
              <div className="mt-1">No bookings, holds, or blocks overlap this date selection.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {detailEvents.map((event) => (
                <div key={`${event.type}:${event.id}`} className="rounded-2xl border border-line/80 bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-primary">
                      {event.propertyTitle}
                    </div>
                    <StatusPill tone={statusTone(event)}>
                      {event.type === "BOOKING" ? event.status : event.type}
                    </StatusPill>
                  </div>

                  <div className="mt-3 grid gap-3 text-sm text-secondary sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-xs font-semibold text-muted">Check-in</div>
                      <div className="mt-1">{format(parseISO(event.start), "MMM d, yyyy")}</div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-muted">Check-out</div>
                      <div className="mt-1">{format(parseISO(event.end), "MMM d, yyyy")}</div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-muted">Guest</div>
                      <div className="mt-1">{event.guestDisplay ?? "-"}</div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-muted">Booking ref</div>
                      <div className="mt-1 font-mono text-xs">{event.bookingRef ?? "-"}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-secondary">
                    <span className="inline-flex items-center gap-1 rounded-full bg-warm-alt px-3 py-1">
                      <CalendarCheck2 className="h-3.5 w-3.5" />
                      Status: {event.status}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-warm-alt px-3 py-1">
                      Value: {formatMoney(event.totalAmount, event.currency)}
                    </span>
                    {event.note ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warm-alt px-3 py-1">
                        Note: {event.note}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
