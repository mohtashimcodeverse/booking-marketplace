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

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

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

/**
 * Premium + readable palette rules
 * - Use CSS vars for system colors where possible
 * - Use richer tints so blocks look clearly different
 * - Keep it elegant: soft shadow + subtle ring; NO hard borders
 */
function tone(status: SharedAvailabilityStatus): {
  // full cell fill + hover
  fill: string;
  hoverFill: string;

  // accent rail (left)
  rail: string;

  // dot + small badge chip
  dot: string;
  chipBg: string;
  chipText: string;

  // focus ring
  focusRing: string;
} {
  // Available: richer emerald tint (still premium)
  if (status === "AVAILABLE") {
    return {
      fill: "bg-[rgb(var(--color-success-rgb)/0.20)]",
      hoverFill: "hover:bg-[rgb(var(--color-success-rgb)/0.26)]",
      rail: "bg-[rgb(var(--color-success-rgb)/0.85)]",
      dot: "bg-[rgb(var(--color-success-rgb)/1)]",
      chipBg: "bg-[rgb(var(--color-success-rgb)/0.18)]",
      chipText: "text-[rgb(var(--color-success-rgb)/1)]",
      focusRing: "focus-visible:ring-[rgb(var(--color-success-rgb)/0.22)]",
    };
  }

  // Booked: deep rose (use your danger var but make tint stronger)
  if (status === "BOOKED") {
    return {
      fill: "bg-[rgb(var(--color-danger-rgb)/0.20)]",
      hoverFill: "hover:bg-[rgb(var(--color-danger-rgb)/0.26)]",
      rail: "bg-[rgb(var(--color-danger-rgb)/0.85)]",
      dot: "bg-[rgb(var(--color-danger-rgb)/1)]",
      chipBg: "bg-[rgb(var(--color-danger-rgb)/0.18)]",
      chipText: "text-[rgb(var(--color-danger-rgb)/1)]",
      focusRing: "focus-visible:ring-[rgb(var(--color-danger-rgb)/0.22)]",
    };
  }

  // Hold: warm amber (warning)
  if (status === "HOLD") {
    return {
      fill: "bg-[rgb(var(--color-warning-rgb)/0.22)]",
      hoverFill: "hover:bg-[rgb(var(--color-warning-rgb)/0.28)]",
      rail: "bg-[rgb(var(--color-warning-rgb)/0.90)]",
      dot: "bg-[rgb(var(--color-warning-rgb)/1)]",
      chipBg: "bg-[rgb(var(--color-warning-rgb)/0.20)]",
      chipText: "text-[rgb(var(--color-warning-rgb)/1)]",
      focusRing: "focus-visible:ring-[rgb(var(--color-warning-rgb)/0.22)]",
    };
  }

  // Blocked: ink slate (more obvious than current)
  return {
    fill: "bg-[rgb(var(--color-ink-2-rgb)/0.12)]",
    hoverFill: "hover:bg-[rgb(var(--color-ink-2-rgb)/0.18)]",
    rail: "bg-[rgb(var(--color-ink-2-rgb)/0.85)]",
    dot: "bg-[rgb(var(--color-ink-2-rgb)/1)]",
    chipBg: "bg-[rgb(var(--color-ink-2-rgb)/0.10)]",
    chipText: "text-[rgb(var(--color-ink-2-rgb)/0.95)]",
    focusRing: "focus-visible:ring-[rgb(var(--color-ink-2-rgb)/0.20)]",
  };
}

function LegendPill(props: { status: SharedAvailabilityStatus; label: string }) {
  const t = tone(props.status);
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm ring-1 ring-black/5">
      <span className={cn("h-2.5 w-2.5 rounded-full", t.dot)} />
      <span className="text-xs font-semibold text-primary">{props.label}</span>
    </span>
  );
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

  const dayMap = useMemo(() => new Map(props.days.map((row) => [row.date, row.status])), [props.days]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(props.month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(props.month), { weekStartsOn: 1 });
    const out: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
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
    <section className={cn("premium-card-tinted rounded-3xl p-4 shadow-soft sm:p-5", props.className)}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-sm font-semibold text-primary">{props.title}</div>
          {props.subtitle ? <div className="mt-1 text-sm text-secondary">{props.subtitle}</div> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => props.onMonthChange(addMonths(props.month, -1))}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white/70 px-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 hover:bg-white active:scale-[0.99]"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5">
            {format(props.month, "MMMM yyyy")}
          </div>

          <button
            type="button"
            onClick={() => props.onMonthChange(addMonths(props.month, 1))}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white/70 px-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 hover:bg-white active:scale-[0.99]"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-3",
          props.propertySelector
            ? "lg:grid-cols-[1fr_auto] lg:items-center"
            : "sm:flex sm:items-center sm:justify-end",
        )}
      >
        {props.propertySelector ? props.propertySelector : null}

        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          {legend.map((item) => (
            <LegendPill key={item.status} status={item.status} label={item.label} />
          ))}
        </div>

        <details className="sm:hidden">
          <summary className="cursor-pointer rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-primary shadow-sm ring-1 ring-black/5">
            Calendar legend
          </summary>
          <div className="mt-2 grid gap-2">
            {legend.map((item) => (
              <LegendPill key={`m-${item.status}`} status={item.status} label={item.label} />
            ))}
          </div>
        </details>
      </div>

      <div className="mt-2 text-xs text-muted sm:hidden">Swipe left or right on calendar to change month.</div>

      <div
        className="mt-4 rounded-3xl bg-white/60 p-3 shadow-sm ring-1 ring-black/5"
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
            const t = tone(status);
            const srLabel = labelForStatus(status, props.role);

            const base = cn(
              "relative h-20 overflow-hidden rounded-2xl p-2 text-left transition",
              "shadow-[0_10px_22px_rgba(11,15,25,0.08)] ring-1 ring-black/5",
              t.fill,
              t.hoverFill,
              !isSameMonth(day, props.month) && "opacity-50",
              selected && "ring-2 ring-[rgba(198,169,109,0.65)]",
              "outline-none focus-visible:ring-4 focus-visible:ring-[rgba(198,169,109,0.28)]",
              clickable && "active:scale-[0.99]",
            );

            const content = (
              <>
                {/* Accent rail */}
                <div className={cn("pointer-events-none absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full", t.rail)} />

                {/* Day number + status dot */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-primary">{format(day, "d")}</span>
                  <span className={cn("mt-0.5 h-2.5 w-2.5 rounded-full", t.dot)} aria-hidden="true" />
                </div>

                {/* Tiny chip (only on md+ so it stays clean) */}
                <div className="mt-2 hidden sm:block">
                  <span className={cn("inline-flex rounded-full px-2 py-1 text-[10px] font-semibold", t.chipBg, t.chipText)}>
                    {srLabel.toUpperCase()}
                  </span>
                </div>

                {/* SR only label */}
                <span className="sr-only">{srLabel}</span>

                {/* subtle bottom sheen */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(to_top,rgba(255,255,255,0.38),rgba(255,255,255,0))]" />
              </>
            );

            if (clickable) {
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => props.onSelectDay?.(day)}
                  className={cn(base, t.focusRing)}
                >
                  {content}
                </button>
              );
            }

            return (
              <div key={day.toISOString()} className={base}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
