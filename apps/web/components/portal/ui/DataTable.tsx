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
    <div className="premium-card overflow-hidden rounded-3xl">
      <div className="border-b border-line/50 bg-bg-2/86 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-primary">{props.title}</div>
              {typeof props.count === "number" ? (
                <div className="rounded-full border border-line bg-brand-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  {props.count}
                </div>
              ) : null}
            </div>
            {props.subtitle ? <div className="mt-1 text-sm text-secondary">{props.subtitle}</div> : null}
          </div>

          {props.headerRight ? <div className="shrink-0">{props.headerRight}</div> : null}
        </div>
      </div>

      {props.rows.length === 0 ? (
        <div className="p-8">
          <div className="rounded-3xl border border-line/50 bg-bg p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface shadow-sm ring-1 ring-line/55">
                <Search className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-primary">Nothing to show</div>
                <div className="mt-1 text-sm text-secondary">{props.empty ?? "No rows found."}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-surface p-4 md:hidden">
            <div className="space-y-3">
              {props.rows.map((row, idx) => {
                const key = row.id ?? `mrow_${idx}`;
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
                      "rounded-2xl border border-line/60 bg-surface p-4 shadow-sm",
                      clickable ? "cursor-pointer hover:bg-brand-soft-2/70" : "cursor-default",
                      "outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                    )}
                  >
                    <div className="space-y-2">
                      {props.columns.map((c) => (
                        <div key={c.key} className="grid grid-cols-[110px_1fr] gap-2 text-sm">
                          <div className="text-xs font-semibold tracking-wide text-muted">{c.header}</div>
                          <div className="min-w-0 text-primary">{c.render(row)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      {props.rowActions ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {props.rowActions(row)}
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block">
          {/* Header row */}
          {props.hideHeaderRow ? null : (
            <div className="grid grid-cols-12 gap-3 border-b border-line/50 bg-bg-2 px-5 py-3 text-[12px] font-semibold tracking-wide text-muted">
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
            <div className="divide-y divide-line/50">
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
                      "bg-surface transition-colors",
                      clickable ? "cursor-pointer hover:border-l-2 hover:border-brand hover:bg-brand-soft-2" : "cursor-default",
                      "outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
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
                        <ChevronRight className="h-4 w-4 text-muted" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface p-4 sm:p-5">
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
                        "rounded-3xl border border-line/50 bg-surface shadow-sm transition",
                        clickable ? "cursor-pointer hover:border-brand/45 hover:shadow-md hover:bg-brand-soft-2" : "cursor-default",
                        "outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
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
                            <ChevronRight className="h-4 w-4 text-muted" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}
