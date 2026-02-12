"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export function Toolbar(props: {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  right?: React.ReactNode;
}) {
  const [q, setQ] = useState("");

  const placeholder = useMemo(
    () => props.searchPlaceholder ?? "Search…",
    [props.searchPlaceholder],
  );

  return (
    <section className="rounded-3xl border border-line/50 bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-primary">
            {props.title}
          </h2>
          {props.subtitle ? (
            <p className="mt-1 max-w-2xl text-sm text-secondary">
              {props.subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => {
                const v = e.target.value;
                setQ(v);
                props.onSearch?.(v);
              }}
              placeholder={placeholder}
              className="h-11 w-full rounded-2xl border border-line/80 bg-surface pl-10 pr-3 text-sm text-primary shadow-sm outline-none placeholder:text-muted focus:border-brand/45 focus:ring-4 focus:ring-brand/20 sm:w-[320px]"
            />
          </div>

          {props.right ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {props.right}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
