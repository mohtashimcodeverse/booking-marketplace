"use client";

import { useEffect, useState } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { getPropertyCalendarBySlug } from "@/lib/api/properties";
import { SharedAvailabilityCalendar } from "@/components/calendar/SharedAvailabilityCalendar";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

type CalendarState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      days: Array<{ date: string; status: "AVAILABLE" | "BOOKED" | "HOLD" | "BLOCKED" }>;
      from: string;
      to: string;
    };

function toIsoDay(value: Date): string {
  return format(value, "yyyy-MM-dd");
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

  if (state.kind === "loading") {
    return (
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="space-y-3">
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-[320px]" />
        </div>
      </section>
    );
  }

  if (state.kind === "error") {
    return (
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="rounded-2xl border border-danger/30 bg-danger/12 p-4 text-sm text-danger">
          {state.message}
        </div>
      </section>
    );
  }

  return (
    <SharedAvailabilityCalendar
      role="public"
      month={month}
      onMonthChange={setMonth}
      days={state.days}
      title="Availability calendar"
      subtitle={`Live status for ${format(month, "MMMM yyyy")} with held and unavailable dates shown in real time.`}
    />
  );
}
