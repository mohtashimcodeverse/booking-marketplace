"use client";

import type React from "react";

type Tone = "neutral" | "success" | "warning" | "danger";

const TONES: Record<Tone, { bg: string; fg: string; ring: string }> = {
  neutral: { bg: "bg-slate-50", fg: "text-slate-700", ring: "ring-slate-200" },
  success: { bg: "bg-emerald-50", fg: "text-emerald-700", ring: "ring-emerald-200" },
  warning: { bg: "bg-amber-50", fg: "text-amber-700", ring: "ring-amber-200" },
  danger: { bg: "bg-rose-50", fg: "text-rose-700", ring: "ring-rose-200" },
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function toneFromStatus(raw: string | null | undefined): Tone {
  const s = (raw ?? "").trim().toUpperCase();
  if (!s) return "neutral";

  if (["SUCCEEDED", "SUCCESS", "PAID", "FINALIZED", "COMPLETED", "APPROVED", "PUBLISHED", "ACTIVE"].includes(s)) {
    return "success";
  }
  if (["FAILED", "FAIL", "CANCELLED", "CANCELED", "VOID", "REJECTED", "BLOCKED", "EXPIRED"].includes(s)) {
    return "danger";
  }
  if (["PENDING", "PROCESSING", "DRAFT", "REVIEW", "IN_REVIEW", "ON_HOLD", "HOLD"].includes(s)) {
    return "warning";
  }
  return "neutral";
}

export function StatusPill(props: {
  tone?: Tone;
  children?: React.ReactNode;
  status?: string;
  value?: string;
  className?: string;
}) {
  const statusText = props.status ?? props.value;
  const t = TONES[props.tone ?? toneFromStatus(statusText)] ?? TONES.neutral;
  const content = props.children ?? statusText ?? "—";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        t.bg,
        t.fg,
        t.ring,
        props.className
      )}
    >
      {content}
    </span>
  );
}
