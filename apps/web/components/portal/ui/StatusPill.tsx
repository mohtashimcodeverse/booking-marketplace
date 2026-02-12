"use client";

import type React from "react";

type Tone = "neutral" | "success" | "warning" | "danger";

const TONES: Record<Tone, { bg: string; fg: string; ring: string }> = {
  neutral: { bg: "bg-warm-alt", fg: "text-secondary", ring: "ring-line" },
  success: { bg: "bg-success/12", fg: "text-success", ring: "ring-success/30" },
  warning: { bg: "bg-warning/12", fg: "text-warning", ring: "ring-warning/30" },
  danger: { bg: "bg-danger/12", fg: "text-danger", ring: "ring-danger/30" },
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
