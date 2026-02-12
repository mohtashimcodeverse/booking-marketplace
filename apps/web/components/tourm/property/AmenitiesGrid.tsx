import type { ReactNode } from "react";
import { getAmenityMeta } from "@/components/icons/amenities";

export type AmenitiesGridItem = {
  key: string; // can be backend enum or raw string
  label?: string; // optional override (rare)
};

export type AmenitiesGridProps = {
  title?: string;
  items: AmenitiesGridItem[];
  columns?: 2 | 3 | 4;
  variant?: "card" | "section";
  footer?: ReactNode;
};

function colsClass(columns: 2 | 3 | 4) {
  if (columns === 2) return "grid-cols-1 sm:grid-cols-2";
  if (columns === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

export default function AmenitiesGrid({
  title = "Amenities",
  items,
  columns = 3,
  variant = "section",
  footer,
}: AmenitiesGridProps) {
  const isLight = variant === "section";

  const shell = isLight
    ? "rounded-2xl border border-line bg-surface p-5 md:p-6"
    : "rounded-2xl border border-inverted/10 bg-surface/[0.03] p-5 md:p-6";

  const titleText = isLight ? "text-primary" : "text-inverted/90";
  const subText = isLight ? "text-secondary" : "text-inverted/60";

  const itemBorder = isLight ? "border-line" : "border-inverted/10";
  const itemBg = isLight ? "bg-surface" : "bg-surface/[0.02]";
  const itemHover = isLight ? "hover:bg-warm-alt" : "hover:bg-surface/[0.04]";

  const iconWrapBorder = isLight ? "border-line" : "border-inverted/10";
  const iconWrapBg = isLight ? "bg-warm-alt" : "bg-surface/[0.03]";
  const iconColor = isLight ? "text-secondary" : "text-inverted/85";

  const labelText = isLight ? "text-primary" : "text-inverted/85";
  const smallText = isLight ? "text-muted" : "text-inverted/50";

  return (
    <section className={shell}>
      {title ? (
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className={`text-lg font-semibold tracking-tight ${titleText}`}>{title}</h3>
            <p className={`mt-1 text-sm ${subText}`}>
              Everything included in your stay — clearly listed, icon-first.
            </p>
          </div>
        </div>
      ) : null}

      <div className={`mt-5 grid gap-3 ${colsClass(columns)}`}>
        {items.map((it) => {
          const meta = getAmenityMeta(it.key);
          const Icon = meta.Icon;
          const label = it.label?.trim() ? it.label.trim() : meta.label;

          return (
            <div
              key={`${it.key}-${label}`}
              className={[
                "group flex items-center gap-3 rounded-xl border px-4 py-3 transition",
                itemBorder,
                itemBg,
                itemHover,
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-xl border",
                  iconWrapBorder,
                  iconWrapBg,
                ].join(" ")}
              >
                <Icon className={`h-[20px] w-[20px] ${iconColor}`} />
              </div>

              <div className="min-w-0">
                <div className={`truncate text-sm font-medium ${labelText}`}>{label}</div>
                <div className={`mt-0.5 text-xs ${smallText}`}>Included</div>
              </div>
            </div>
          );
        })}
      </div>

      {footer ? <div className="mt-5">{footer}</div> : null}
    </section>
  );
}
