"use client";

import { useMemo, useRef, type ReactNode, type TouchEvent } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type SharedAvailabilityStatus = "AVAILABLE" | "BOOKED" | "HOLD" | "BLOCKED";
export type SharedAvailabilityRole = "admin" | "vendor" | "customer" | "public";

export type SharedAvailabilityDay = {
  date: string;
  status: SharedAvailabilityStatus;
};

export type SharedAvailabilityRange = {
  from: Date | null;
  to: Date | null;
};

function toIsoDay(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

function normalizeStatusByRole(
  status: SharedAvailabilityStatus,
  role: SharedAvailabilityRole,
): SharedAvailabilityStatus {
  // Customer/public should not see vendor/admin-block distinction.
  if ((role === "customer" || role === "public") && status === "BLOCKED") return "BOOKED";
  return status;
}

function inSelectedRange(day: Date, selectedRange: SharedAvailabilityRange | null | undefined): boolean {
  if (!selectedRange?.from) return false;
  const from = selectedRange.from;
  const to = selectedRange.to ?? selectedRange.from;
  const start = isAfter(from, to) ? to : from;
  const end = isAfter(from, to) ? from : to;
  return !isBefore(day, start) && !isAfter(day, end);
}

function cellClass(status: SharedAvailabilityStatus, selected: boolean): string {
  if (status === "AVAILABLE") {
    return selected
      ? "bg-success text-inverted ring-success/80"
      : "bg-success/12 text-success ring-success/35 hover:bg-success/20";
  }
  if (status === "BOOKED") {
    return selected
      ? "bg-danger text-inverted ring-danger/80"
      : "bg-danger/12 text-danger ring-danger/35 hover:bg-danger/20";
  }
  if (status === "HOLD") {
    return selected
      ? "bg-warning text-inverted ring-warning/80"
      : "bg-warning/12 text-warning ring-warning/35 hover:bg-warning/20";
  }
  return selected
    ? "bg-ink-2 text-inverted ring-ink-2/80"
    : "bg-ink-2/12 text-ink-2 ring-ink-2/35 hover:bg-ink-2/18";
}

function indicator(status: SharedAvailabilityStatus): ReactNode {
  if (status === "BOOKED") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
        ×
      </span>
    );
  }
  if (status === "HOLD") return <span className="h-2.5 w-2.5 rounded-full bg-warning" />;
  if (status === "BLOCKED") return <span className="h-2.5 w-2.5 rounded-full bg-ink-2" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-success" />;
}

function labelForStatus(status: SharedAvailabilityStatus, role: SharedAvailabilityRole): string {
  if ((role === "customer" || role === "public") && status === "BLOCKED") return "Unavailable";
  if (status === "BOOKED") return "Booked";
  if (status === "HOLD") return "Hold";
  if (status === "BLOCKED") return "Blocked";
  return "Available";
}

function legendItems(role: SharedAvailabilityRole): Array<{ status: SharedAvailabilityStatus; label: string }> {
  if (role === "customer" || role === "public") {
    return [
      { status: "AVAILABLE", label: "Available" },
      { status: "BOOKED", label: "Unavailable" },
      { status: "HOLD", label: "Hold" },
    ];
  }
  return [
    { status: "AVAILABLE", label: "Available" },
    { status: "BOOKED", label: "Booked" },
    { status: "HOLD", label: "Hold" },
    { status: "BLOCKED", label: "Blocked" },
  ];
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function SharedAvailabilityCalendar(props: {
  role: SharedAvailabilityRole;
  month: Date;
  onMonthChange: (month: Date) => void;
  days: SharedAvailabilityDay[];
  title: string;
  subtitle?: string;
  propertySelector?: ReactNode;
  selectedRange?: SharedAvailabilityRange | null;
  onSelectDay?: (day: Date) => void;
  className?: string;
}) {
  const touchStartX = useRef<number | null>(null);

  const dayMap = useMemo(() => {
    return new Map(props.days.map((row) => [row.date, row.status]));
  }, [props.days]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(props.month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(props.month), { weekStartsOn: 1 });
    const out: Date[] = [];
    for (let day = start; day <= end; day = addDays(day, 1)) out.push(day);
    return out;
  }, [props.month]);

  const legend = useMemo(() => legendItems(props.role), [props.role]);
  const clickable = typeof props.onSelectDay === "function";

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 36) return;
    if (delta < 0) props.onMonthChange(addMonths(props.month, 1));
    if (delta > 0) props.onMonthChange(addMonths(props.month, -1));
  }

  return (
    <section className={cn("rounded-3xl border border-line/50 bg-surface p-4 shadow-sm sm:p-5", props.className)}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-sm font-semibold text-primary">{props.title}</div>
          {props.subtitle ? <div className="mt-1 text-sm text-secondary">{props.subtitle}</div> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => props.onMonthChange(addMonths(props.month, -1))}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt active:scale-[0.99]"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm">
            {format(props.month, "MMMM yyyy")}
          </div>

          <button
            type="button"
            onClick={() => props.onMonthChange(addMonths(props.month, 1))}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt active:scale-[0.99]"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-3",
          props.propertySelector ? "lg:grid-cols-[1fr_auto] lg:items-center" : "sm:flex sm:items-center sm:justify-end",
        )}
      >
        {props.propertySelector ? props.propertySelector : null}

        <div className="hidden flex-wrap items-center gap-2 text-xs font-semibold sm:flex">
          {legend.map((item) => (
            <span
              key={item.status}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 ring-1 ring-line/90"
            >
              {indicator(item.status)}
              {item.label}
            </span>
          ))}
        </div>

        <details className="sm:hidden">
          <summary className="cursor-pointer rounded-xl border border-line/70 bg-surface px-3 py-2 text-xs font-semibold text-primary">
            Calendar legend
          </summary>
          <div className="mt-2 grid gap-2 text-xs font-semibold">
            {legend.map((item) => (
              <span
                key={`mobile-${item.status}`}
                className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 ring-1 ring-line/90"
              >
                {indicator(item.status)}
                {item.label}
              </span>
            ))}
          </div>
        </details>
      </div>

      <div className="mt-2 text-xs text-muted sm:hidden">Swipe left or right on calendar to change month.</div>

      <div
        className="mt-4 rounded-2xl border border-line bg-surface p-3"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold tracking-wide text-muted">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {gridDays.map((day) => {
            const rawStatus = dayMap.get(toIsoDay(day)) ?? "AVAILABLE";
            const status = normalizeStatusByRole(rawStatus, props.role);
            const selected = inSelectedRange(day, props.selectedRange);
            const label = labelForStatus(status, props.role);
            const baseClass = cn(
              "h-20 rounded-2xl p-2 text-left ring-1 transition",
              cellClass(status, selected),
              !isSameMonth(day, props.month) && "opacity-45",
            );

            if (clickable) {
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => props.onSelectDay?.(day)}
                  className={cn(baseClass, "active:scale-[0.99]")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold">{format(day, "d")}</span>
                    {indicator(status)}
                  </div>
                  <div className="mt-2 hidden text-[10px] font-semibold uppercase tracking-wide sm:block">
                    {label}
                  </div>
                </button>
              );
            }

            return (
              <div key={day.toISOString()} className={baseClass}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold">{format(day, "d")}</span>
                  {indicator(status)}
                </div>
                <div className="mt-2 hidden text-[10px] font-semibold uppercase tracking-wide sm:block">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
