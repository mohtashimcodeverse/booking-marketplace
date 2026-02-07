"use client";

import { useMemo } from "react";
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
  const selected: DateRange | undefined = useMemo(() => {
    const from = props.value.from ? new Date(props.value.from) : undefined;
    const to = props.value.to ? new Date(props.value.to) : undefined;
    if (!from && !to) return undefined;
    return { from, to };
  }, [props.value.from, props.value.to]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
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
        numberOfMonths={1}
      />
    </div>
  );
}
