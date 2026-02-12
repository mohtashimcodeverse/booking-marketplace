"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPropertyCalendarBySlug } from "@/lib/api/properties";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

type CalendarState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      days: Array<{ date: string; status: "AVAILABLE" | "BOOKED" | "BLOCKED" }>;
      from: string;
      to: string;
    };

function toIsoDay(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

function toneClass(status: "AVAILABLE" | "BOOKED" | "BLOCKED"): string {
  if (status === "BOOKED") return "bg-brand/15 text-primary ring-brand/30";
  if (status === "BLOCKED") return "bg-danger/12 text-danger ring-danger/30";
  return "bg-surface text-primary ring-line/70";
}

export default function PublicPropertyCalendar({ slug }: { slug: string }) {
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [state, setState] = useState<CalendarState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function load() {
      setState({ kind: "loading" });
      const from = toIsoDay(startOfMonth(month));
      const to = toIsoDay(addMonths(startOfMonth(month), 1));
      const res = await getPropertyCalendarBySlug(slug, { from, to });
      if (!alive) return;

      if (!res.ok) {
        setState({
          kind: "error",
          message: res.message || "Failed to load calendar",
        });
        return;
      }

      setState({
        kind: "ready",
        days: res.data.days ?? [],
        from: res.data.from,
        to: res.data.to,
      });
    }

    void load();
    return () => {
      alive = false;
    };
  }, [month, slug]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const out: Date[] = [];
    for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
      out.push(cursor);
    }
    return out;
  }, [month]);

  const dayMap = useMemo(() => {
    if (state.kind !== "ready") return new Map<string, "AVAILABLE" | "BOOKED" | "BLOCKED">();
    return new Map(state.days.map((row) => [row.date, row.status]));
  }, [state]);

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-primary">Availability calendar</div>
          <div className="mt-1 text-xs text-secondary/70">
            Availability is backend-truth: available, booked, and vendor blocked dates.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((previous) => addMonths(previous, -1))}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-primary hover:bg-warm-base"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <div className="rounded-xl border border-line bg-warm-base px-3 py-2 text-sm font-semibold text-primary">
            {format(month, "MMMM yyyy")}
          </div>
          <button
            type="button"
            onClick={() => setMonth((previous) => addMonths(previous, 1))}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-primary hover:bg-warm-base"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-secondary">
        <span className="inline-flex items-center gap-1 rounded-full bg-warm-alt px-3 py-1 ring-1 ring-line/90">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-soft" /> Available
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-warm-alt px-3 py-1 ring-1 ring-line/90">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Booked
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-warm-alt px-3 py-1 ring-1 ring-line/90">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Blocked by vendor
        </span>
      </div>

      {state.kind === "loading" ? (
        <div className="mt-4 space-y-3">
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-[280px]" />
        </div>
      ) : state.kind === "error" ? (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/12 p-4 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-3">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-muted">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {gridDays.map((day) => {
              const iso = toIsoDay(day);
              const status = dayMap.get(iso) ?? "AVAILABLE";
              return (
                <div
                  key={iso}
                  className={[
                    "h-14 rounded-xl p-2 text-left text-xs ring-1",
                    toneClass(status),
                    !isSameMonth(day, month) ? "opacity-45" : "",
                  ].join(" ")}
                >
                  <div className="font-semibold">{format(day, "d")}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide">{status}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
