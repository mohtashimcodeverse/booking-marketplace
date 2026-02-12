import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export type CardListItem = {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
};

export function CardList(props: {
  title: ReactNode;
  subtitle?: ReactNode;
  items: CardListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line/50 bg-surface shadow-sm">
      <div className="border-b border-line/50 bg-warm-base/40 px-5 py-4">
        <div className="text-sm font-semibold text-primary">{props.title}</div>
        {props.subtitle ? <div className="mt-1 text-sm text-secondary">{props.subtitle}</div> : null}
      </div>

      {props.items.length === 0 ? (
        <div className="p-8">
          <div className="rounded-2xl border border-dashed border-line/80 bg-warm-base p-6 text-center">
            <div className="text-sm font-semibold text-primary">{props.emptyTitle ?? "No records"}</div>
            <div className="mt-1 text-sm text-secondary">
              {props.emptyDescription ?? "There are no items to display right now."}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-4 sm:p-5">
          {props.items.map((item) => (
            <div
              key={item.id}
              role={item.onClick ? "button" : undefined}
              tabIndex={item.onClick ? 0 : undefined}
              onClick={() => item.onClick?.()}
              onKeyDown={(event) => {
                if (!item.onClick) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  item.onClick();
                }
              }}
              className={cn(
                "rounded-2xl border border-line/80 bg-surface p-4 shadow-sm transition",
                item.onClick ? "cursor-pointer hover:bg-warm-alt/70 hover:shadow" : "cursor-default",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary">{item.title}</div>
                  {item.subtitle ? <div className="mt-1 text-sm text-secondary">{item.subtitle}</div> : null}
                </div>

                <div className="flex items-center gap-2">
                  {item.status}
                  {item.actions ? (
                    <div
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      className="flex items-center gap-2"
                    >
                      {item.actions}
                    </div>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-inverted/70" />
                  )}
                </div>
              </div>

              {item.meta ? <div className="mt-3 text-sm text-secondary">{item.meta}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
