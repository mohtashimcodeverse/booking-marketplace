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
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarCheck2 } from "lucide-react";
import type {
  PortalCalendarEvent,
  PortalCalendarResponse,
} from "@/lib/api/portal/calendar";
import {
  SharedAvailabilityCalendar,
  type SharedAvailabilityStatus,
} from "@/components/calendar/SharedAvailabilityCalendar";
import { Modal } from "@/components/portal/ui/Modal";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

type RoleView = "vendor" | "admin" | "customer";

type DateRange = {
  from: Date | null;
  to: Date | null;
};

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

function toCalendarStatus(tone: "booked" | "blocked" | "held" | "available"): SharedAvailabilityStatus {
  if (tone === "booked") return "BOOKED";
  if (tone === "blocked") return "BLOCKED";
  if (tone === "held") return "HOLD";
  return "AVAILABLE";
}

function statusTone(event: PortalCalendarEvent): "success" | "warning" | "danger" | "neutral" {
  if (event.type === "BOOKING") {
    const value = event.status.toUpperCase();
    if (value.includes("CONFIRM") || value.includes("COMPLETE")) return "success";
    if (value.includes("PENDING") || value.includes("HOLD")) return "warning";
    if (value.includes("CANCEL") || value.includes("FAILED")) return "danger";
    return "neutral";
  }

  if (event.type === "BLOCKED") return "neutral";
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

function roleIntro(role: RoleView): string {
  if (role === "vendor") return "Available, booked, hold, and blocked days in one monthly view.";
  if (role === "admin") return "Platform availability with booking, hold, and admin/vendor blocked signals.";
  return "Read-only availability to support confident booking decisions.";
}

export function PortalAvailabilityCalendar(props: {
  role: RoleView;
  loadData: (params: {
    from: string;
    to: string;
    propertyId?: string;
  }) => Promise<PortalCalendarResponse>;
  allowBlockControls?: boolean;
  blockControlMode?: "direct" | "request";
  onBlockRange?: (params: {
    propertyId: string;
    from: string;
    to: string;
    note?: string;
  }) => Promise<unknown>;
  onUnblockRange?: (params: {
    propertyId: string;
    from: string;
    to: string;
    note?: string;
  }) => Promise<unknown>;
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

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const out: Array<{ date: string; status: SharedAvailabilityStatus }> = [];

    for (let day = start; day <= end; day = addDays(day, 1)) {
      out.push({
        date: toIsoDay(day),
        status: toCalendarStatus(classifyDay(events, day)),
      });
    }
    return out;
  }, [events, month]);

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

  const propertySelector = (
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
  );

  return (
    <div className="space-y-5">
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
        <>
          <SharedAvailabilityCalendar
            role={role}
            month={month}
            onMonthChange={setMonth}
            days={calendarDays}
            title="Monthly availability"
            subtitle={roleIntro(role)}
            propertySelector={propertySelector}
            selectedRange={range}
            onSelectDay={pickDay}
          />

          {props.allowBlockControls && role === "vendor" ? (
            <div className="rounded-2xl border border-line/80 bg-surface p-3">
              <div className="text-sm font-semibold text-primary">
                {props.blockControlMode === "request" ? "Block date request" : "Owner-use date controls"}
              </div>
              <div className="mt-1 text-xs text-secondary">
                {props.blockControlMode === "request"
                  ? "Submit a block request for admin approval. End date is checkout-style (exclusive)."
                  : "Block or unblock dates for owner-use. End date is checkout-style (exclusive)."}
              </div>
              <div
                className={[
                  "mt-3 grid gap-2",
                  props.blockControlMode === "request"
                    ? "lg:grid-cols-[1fr_1fr_2fr_auto]"
                    : "lg:grid-cols-[1fr_1fr_2fr_auto_auto]",
                ].join(" ")}
              >
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
                      setRangeMessage(
                        props.blockControlMode === "request"
                          ? "Block request submitted successfully."
                          : "Dates blocked successfully."
                      );
                      setRefreshTick((value) => value + 1);
                    } catch (error) {
                      setRangeError(
                        error instanceof Error
                          ? error.message
                          : props.blockControlMode === "request"
                            ? "Failed to submit block request"
                            : "Failed to block dates"
                      );
                    } finally {
                      setRangeBusy(null);
                    }
                  }}
                  className="rounded-xl bg-danger px-3 py-2 text-sm font-semibold text-inverted hover:bg-danger disabled:opacity-60"
                >
                  {props.blockControlMode === "request" ? "Submit request" : "Block"}
                </button>
                {props.blockControlMode !== "request" && props.onUnblockRange ? (
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
                        setRangeError(error instanceof Error ? error.message : "Failed to unblock dates");
                      } finally {
                        setRangeBusy(null);
                      }
                    }}
                    className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
                  >
                    Unblock
                  </button>
                ) : null}
              </div>
              {rangeBusy ? <div className="mt-2 text-xs font-semibold text-secondary">{rangeBusy}</div> : null}
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
        </>
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
              {(data?.properties ?? []).find((property) => property.id === (selectedPropertyId ?? data?.selectedPropertyId ?? ""))?.title
                ?? "Selected property"}
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
                    <div className="text-sm font-semibold text-primary">{event.propertyTitle}</div>
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
