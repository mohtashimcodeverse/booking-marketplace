"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function JsonDrawer(props: {
  title: string;
  triggerLabel?: string;
  value: unknown;
}) {
  const [open, setOpen] = useState(false);
  const json = useMemo(() => prettyJson(props.value), [props.value]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border bg-surface px-3 py-1.5 text-xs font-semibold text-primary hover:bg-warm-alt"
      >
        {props.triggerLabel ?? "Details"}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-dark-1/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute right-4 top-4 bottom-4 w-[min(720px,calc(100%-2rem))] rounded-2xl border bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="text-sm font-semibold text-primary">{props.title}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-surface hover:bg-warm-alt"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="h-[calc(100%-64px)] overflow-auto p-4">
              <pre className="rounded-xl bg-warm-alt p-4 text-xs text-primary overflow-auto">{json}</pre>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
