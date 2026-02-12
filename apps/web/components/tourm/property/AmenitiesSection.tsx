"use client";

import { useMemo, useState } from "react";
import AmenitiesGrid from "@/components/tourm/property/AmenitiesGrid";

export type AmenitiesSectionItem = {
  key: string;
  label?: string;
};

export type AmenitiesSectionProps = {
  title?: string;
  items: AmenitiesSectionItem[];
  previewCount?: number;
};

export default function AmenitiesSection({
  title = "Amenities",
  items,
  previewCount = 12,
}: AmenitiesSectionProps) {
  const [open, setOpen] = useState(false);

  const cleaned = useMemo(() => {
    const out: AmenitiesSectionItem[] = [];
    for (const it of items) {
      const k = it.key.trim();
      const l = (it.label ?? "").trim();
      if (!k && !l) continue;
      out.push({ key: k || l, label: l || undefined });
    }
    return out;
  }, [items]);

  const preview = cleaned.slice(0, previewCount);
  const remaining = Math.max(0, cleaned.length - preview.length);

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-primary">{title}</div>
          <p className="mt-1 text-xs text-secondary">
            Icon-first list, consistent across the site.
          </p>
        </div>

        {cleaned.length > previewCount ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-primary transition hover:bg-warm-alt"
          >
            Show all ({cleaned.length})
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        <AmenitiesGrid
          title=""
          items={preview}
          columns={3}
          variant="section"
        />
      </div>

      {remaining > 0 ? (
        <div className="mt-3 text-xs text-secondary">
          + {remaining} more
        </div>
      ) : null}

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close amenities modal"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-dark-1/50"
          />

          {/* Panel */}
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-3xl bg-surface p-5 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-primary">All amenities</div>
                <div className="mt-1 text-xs text-secondary">
                  Everything included in this stay.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
              >
                Close
              </button>
            </div>

            <div className="mt-5 max-h-[60vh] overflow-auto pr-1">
              {/* We pass items directly; AmenitiesGrid does icon lookup */}
              <AmenitiesGrid
                title=""
                items={cleaned}
                columns={3}
                variant="section"
              />
            </div>

            <div className="mt-4 text-[11px] text-muted">
              Amenities are shown based on the property’s structured catalog (or safe defaults until
              backend parity is enabled).
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
