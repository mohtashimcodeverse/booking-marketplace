"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

export type DateRangeValue = {
  from: string | null; // YYYY-MM-DD
  to: string | null; // YYYY-MM-DD
};

function toISO(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export default function DateRangePicker(props: {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  minDate?: Date;
}) {
  const [months, setMonths] = useState(2);

  useEffect(() => {
    function syncMonths() {
      setMonths(window.innerWidth < 768 ? 1 : 2);
    }
    syncMonths();
    window.addEventListener("resize", syncMonths);
    return () => window.removeEventListener("resize", syncMonths);
  }, []);

  const selected: DateRange | undefined = useMemo(() => {
    const from = props.value.from ? new Date(props.value.from) : undefined;
    const to = props.value.to ? new Date(props.value.to) : undefined;
    if (!from && !to) return undefined;
    return { from, to };
  }, [props.value.from, props.value.to]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-3 shadow-sm">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={(r) => {
          props.onChange({
            from: r?.from ? toISO(r.from) : null,
            to: r?.to ? toISO(r.to) : null,
          });
        }}
        disabled={(d) => {
          if (!props.minDate) return false;
          return d < props.minDate;
        }}
        numberOfMonths={months}
        pagedNavigation
        showOutsideDays
        className="text-primary"
      />
    </div>
  );
}
