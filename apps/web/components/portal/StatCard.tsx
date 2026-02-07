import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: ReactNode;

  /** Optional short helper / description */
  helper?: string;

  /** Optional icon (top-left visual anchor) */
  icon?: ReactNode;

  /** Optional trend indicator */
  trend?: {
    direction: "up" | "down";
    label: string;
  };
}

export function StatCard(props: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      {/* subtle decorative gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#16A6C8]/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500">
              {props.label}
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {props.value}
            </div>
          </div>

          {props.icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 bg-[#f6f3ec] text-slate-700">
              {props.icon}
            </div>
          ) : null}
        </div>

        {props.trend || props.helper ? (
          <div className="mt-4 flex items-center justify-between gap-2">
            {props.trend ? (
              <div
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  props.trend.direction === "up"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700",
                ].join(" ")}
              >
                {props.trend.direction === "up" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {props.trend.label}
              </div>
            ) : (
              <span />
            )}

            {props.helper ? (
              <div className="text-xs text-slate-500">{props.helper}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
