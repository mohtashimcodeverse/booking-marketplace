import type { CSSProperties } from "react";

export type BarPoint = {
  label: string;
  value: number;
};

function clampMin(v: number, min: number): number {
  return v < min ? min : v;
}

export function SimpleBarChart(props: {
  title: string;
  subtitle?: string;
  points: BarPoint[];
  valueSuffix?: string;
}) {
  const max = props.points.reduce((m, p) => (p.value > m ? p.value : m), 0);
  const safeMax = clampMin(max, 1);

  return (
    <div className="rounded-2xl border bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-primary">{props.title}</div>
          {props.subtitle ? <div className="mt-1 text-xs text-muted">{props.subtitle}</div> : null}
        </div>
        <div className="text-xs text-muted">Max: {safeMax}{props.valueSuffix ?? ""}</div>
      </div>

      <div className="mt-5 grid gap-3">
        {props.points.length === 0 ? (
          <div className="text-sm text-secondary">No chart data yet.</div>
        ) : (
          props.points.map((p) => {
            const widthPct = (p.value / safeMax) * 100;
            const style: CSSProperties = { width: `${Math.max(2, widthPct)}%` };

            return (
              <div key={p.label} className="grid grid-cols-[120px_1fr_60px] items-center gap-3">
                <div className="truncate text-xs text-secondary">{p.label}</div>
                <div className="h-2 rounded-full bg-warm-alt">
                  <div className="h-2 rounded-full bg-brand" style={style} />
                </div>
                <div className="text-right text-xs font-semibold text-primary">
                  {p.value}
                  {props.valueSuffix ?? ""}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
