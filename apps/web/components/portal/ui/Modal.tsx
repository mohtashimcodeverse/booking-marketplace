"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type Size = "sm" | "md" | "lg" | "xl";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function sizeClass(size: Size): string {
  if (size === "sm") return "max-w-md";
  if (size === "md") return "max-w-xl";
  if (size === "lg") return "max-w-3xl";
  return "max-w-5xl";
}

export function Modal(props: {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  size?: Size;
  footer?: ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[95]">
      <button
        type="button"
        aria-label="Close modal"
        onClick={props.onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl",
            sizeClass(props.size ?? "md"),
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="border-b border-black/5 bg-[#f6f3ec]/60 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {props.title ? (
                  <div className="truncate text-sm font-semibold text-slate-900">{props.title}</div>
                ) : null}
                {props.subtitle ? (
                  <div className="mt-1 text-xs text-slate-600">{props.subtitle}</div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={props.onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-700" />
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto px-5 py-5">{props.children}</div>

          {props.footer ? (
            <div className="border-t border-black/5 bg-white px-5 py-4">{props.footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
