import type { ReactNode } from "react";
import { ChevronRight, Search } from "lucide-react";

export type Column<Row> = {
  key: string;
  header: string;
  className?: string;
  render: (row: Row) => ReactNode;
};

type Variant = "cards" | "table";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function DataTable<Row extends { id?: string }>(props: {
  title: string;
  subtitle?: ReactNode;
  columns: Array<Column<Row>>;
  rows: Row[];
  empty?: ReactNode;

  /** Optional: render action buttons per row (right-most column) */
  rowActions?: (row: Row) => ReactNode;

  /** Optional: row click (open drawer / navigate). Implemented WITHOUT <button> wrapper to avoid nesting. */
  onRowClick?: (row: Row) => void;

  /** Optional: show a small count pill in the header */
  count?: number;

  /** Optional: right-side header actions (export/add/filter etc.) */
  headerRight?: ReactNode;

  /** Optional: compact mode for dense lists */
  compact?: boolean;

  /** Visual style: "cards" (default) or "table" */
  variant?: Variant;

  /** Hide column header row (useful for card-list feel) */
  hideHeaderRow?: boolean;
}) {
  const compact = props.compact === true;
  const variant: Variant = props.variant ?? "cards";

  const clickable = typeof props.onRowClick === "function";

  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 bg-[#f6f3ec]/40 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-slate-900">{props.title}</div>
              {typeof props.count === "number" ? (
                <div className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-black/10">
                  {props.count}
                </div>
              ) : null}
            </div>
            {props.subtitle ? <div className="mt-1 text-sm text-slate-600">{props.subtitle}</div> : null}
          </div>

          {props.headerRight ? <div className="shrink-0">{props.headerRight}</div> : null}
        </div>
      </div>

      {props.rows.length === 0 ? (
        <div className="p-8">
          <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Search className="h-4 w-4 text-slate-700" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Nothing to show</div>
                <div className="mt-1 text-sm text-slate-600">{props.empty ?? "No rows found."}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header row */}
          {props.hideHeaderRow ? null : (
            <div className="grid grid-cols-12 gap-3 border-b border-black/5 bg-white px-5 py-3 text-[12px] font-semibold tracking-wide text-slate-500">
              {props.columns.map((c) => (
                <div key={c.key} className={c.className ?? "col-span-2"}>
                  {c.header}
                </div>
              ))}
              {props.rowActions ? <div className="col-span-2 text-right">Actions</div> : null}
            </div>
          )}

          {/* Body */}
          {variant === "table" ? (
            <div className="divide-y divide-black/5">
              {props.rows.map((row, idx) => {
                const key = row.id ?? `row_${idx}`;
                return (
                  <div
                    key={key}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={() => props.onRowClick?.(row)}
                    onKeyDown={(e) => {
                      if (!clickable) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        props.onRowClick?.(row);
                      }
                    }}
                    className={cn(
                      "grid grid-cols-12 gap-3 px-5 text-sm",
                      compact ? "py-3" : "py-4",
                      "bg-white transition-colors",
                      clickable ? "cursor-pointer hover:bg-slate-50/60" : "cursor-default",
                      "outline-none focus-visible:ring-4 focus-visible:ring-[#16A6C8]/15"
                    )}
                  >
                    {props.columns.map((c) => (
                      <div key={c.key} className={c.className ?? "col-span-2"}>
                        {c.render(row)}
                      </div>
                    ))}

                    {props.rowActions ? (
                      <div
                        className="col-span-2 flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        {props.rowActions(row)}
                      </div>
                    ) : (
                      <div className="col-span-2 flex items-center justify-end">
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-5">
              <div className="space-y-3">
                {props.rows.map((row, idx) => {
                  const key = row.id ?? `row_${idx}`;
                  return (
                    <div
                      key={key}
                      role={clickable ? "button" : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      onClick={() => props.onRowClick?.(row)}
                      onKeyDown={(e) => {
                        if (!clickable) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          props.onRowClick?.(row);
                        }
                      }}
                      className={cn(
                        "rounded-3xl border border-black/5 bg-white shadow-sm transition",
                        clickable ? "cursor-pointer hover:shadow-md hover:bg-slate-50/30" : "cursor-default",
                        "outline-none focus-visible:ring-4 focus-visible:ring-[#16A6C8]/15"
                      )}
                    >
                      <div className={cn("grid grid-cols-12 gap-3 px-4 sm:px-5 text-sm", compact ? "py-3" : "py-4")}>
                        {props.columns.map((c) => (
                          <div key={c.key} className={c.className ?? "col-span-2"}>
                            {c.render(row)}
                          </div>
                        ))}

                        {props.rowActions ? (
                          <div
                            className="col-span-2 flex items-center justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            {props.rowActions(row)}
                          </div>
                        ) : (
                          <div className="col-span-2 flex items-center justify-end">
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
