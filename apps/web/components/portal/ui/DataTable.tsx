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

/**
 * Portal DataTable — luxury “card list” by default:
 * - NO hard borders
 * - NO grid lines
 * - separation by spacing + shadow + warm surfaces
 * - still supports "table" variant but styled like rows (no dividers)
 */
export function DataTable<Row extends { id?: string }>(props: {
  title: string;
  subtitle?: ReactNode;
  columns: Array<Column<Row>>;
  rows: Row[];
  empty?: ReactNode;

  rowActions?: (row: Row) => ReactNode;
  onRowClick?: (row: Row) => void;

  count?: number;
  headerRight?: ReactNode;

  compact?: boolean;
  variant?: Variant;
  hideHeaderRow?: boolean;
}) {
  const compact = props.compact === true;
  const variant: Variant = props.variant ?? "cards";
  const clickable = typeof props.onRowClick === "function";

  return (
    <div className="premium-card overflow-hidden rounded-3xl">
      {/* Header — no borders, soft band */}
      <div className="bg-[rgba(255,255,255,0.62)] px-5 py-4 shadow-[0_18px_48px_rgba(11,15,25,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-primary">{props.title}</div>

              {typeof props.count === "number" ? (
                <div className="inline-flex items-center rounded-full bg-[rgba(198,169,109,0.18)] px-2.5 py-1 text-xs font-semibold text-[#6B5630] shadow-[0_10px_22px_rgba(11,15,25,0.08)]">
                  {props.count}
                </div>
              ) : null}
            </div>

            {props.subtitle ? (
              <div className="mt-1 text-sm text-secondary">{props.subtitle}</div>
            ) : null}
          </div>

          {props.headerRight ? <div className="shrink-0">{props.headerRight}</div> : null}
        </div>

        {/* gold fade divider */}
        <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.55),rgba(11,15,25,0.0))]" />
      </div>

      {props.rows.length === 0 ? (
        <div className="p-8">
          <div className="rounded-3xl bg-[rgba(255,255,255,0.70)] p-6 shadow-[0_16px_44px_rgba(11,15,25,0.10)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 shadow-[0_12px_30px_rgba(11,15,25,0.10)]">
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
          {/* Mobile — already card-like, just remove borders */}
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
                      "rounded-3xl bg-white/86 p-4 shadow-[0_14px_40px_rgba(11,15,25,0.10)] transition",
                      clickable
                        ? "cursor-pointer hover:translate-y-[-1px] hover:bg-white hover:shadow-[0_18px_52px_rgba(11,15,25,0.14)]"
                        : "cursor-default",
                      "outline-none focus-visible:ring-4 focus-visible:ring-[rgba(198,169,109,0.30)]"
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

          {/* Desktop */}
          <div className="hidden md:block">
            {/* Header row (optional) — no borders, just subtle labels */}
            {props.hideHeaderRow ? null : (
              <div className="px-5 py-3">
                <div className="grid grid-cols-12 gap-3 text-[12px] font-semibold tracking-wide text-muted">
                  {props.columns.map((c) => (
                    <div key={c.key} className={c.className ?? "col-span-2"}>
                      {c.header}
                    </div>
                  ))}
                  {props.rowActions ? <div className="col-span-2 text-right">Actions</div> : null}
                </div>
                <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.35),rgba(11,15,25,0.0))]" />
              </div>
            )}

            {/* Body */}
            {variant === "table" ? (
              <div className="bg-surface px-4 pb-5 sm:px-5">
                <div className="space-y-2.5">
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
                          "rounded-3xl bg-white/84 shadow-[0_14px_40px_rgba(11,15,25,0.10)] transition",
                          clickable
                            ? "cursor-pointer hover:translate-y-[-1px] hover:bg-white hover:shadow-[0_18px_52px_rgba(11,15,25,0.14)]"
                            : "cursor-default",
                          "outline-none focus-visible:ring-4 focus-visible:ring-[rgba(198,169,109,0.30)]"
                        )}
                      >
                        <div
                          className={cn(
                            "grid grid-cols-12 gap-3 px-4 sm:px-5 text-sm",
                            compact ? "py-3" : "py-4"
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

                        {/* subtle gold rail only for clickable rows */}
                        {clickable ? (
                          <div className="h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.22),rgba(11,15,25,0.0))]" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
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
                          "rounded-3xl bg-white/86 shadow-[0_14px_40px_rgba(11,15,25,0.10)] transition",
                          clickable
                            ? "cursor-pointer hover:translate-y-[-1px] hover:bg-white hover:shadow-[0_18px_52px_rgba(11,15,25,0.14)]"
                            : "cursor-default",
                          "outline-none focus-visible:ring-4 focus-visible:ring-[rgba(198,169,109,0.30)]"
                        )}
                      >
                        <div
                          className={cn(
                            "grid grid-cols-12 gap-3 px-4 sm:px-5 text-sm",
                            compact ? "py-3" : "py-4"
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
