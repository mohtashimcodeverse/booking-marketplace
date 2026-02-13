"use client";

import type React from "react";

type Tone = "neutral" | "success" | "warning" | "danger";

const TONES: Record<Tone, { bg: string; fg: string; shadow: string }> = {
  neutral: {
    bg: "bg-[rgba(255,255,255,0.72)]",
    fg: "text-[#0B0F19]/72",
    shadow: "shadow-[0_10px_22px_rgba(11,15,25,0.10)]",
  },
  success: {
    bg: "bg-[rgba(30,122,75,0.12)]",
    fg: "text-success",
    shadow: "shadow-[0_10px_22px_rgba(11,15,25,0.10)]",
  },
  warning: {
    bg: "bg-[rgba(166,106,28,0.12)]",
    fg: "text-warning",
    shadow: "shadow-[0_10px_22px_rgba(11,15,25,0.10)]",
  },
  danger: {
    bg: "bg-[rgba(180,35,24,0.12)]",
    fg: "text-danger",
    shadow: "shadow-[0_10px_22px_rgba(11,15,25,0.10)]",
  },
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
  if (["PENDING", "PROCESSING", "DRAFT", "REVIEW", "IN_REVIEW", "ON_HOLD", "HOLD", "UNDER_REVIEW"].includes(s)) {
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        t.bg,
        t.fg,
        t.shadow,
        props.className
      )}
    >
      {content}
    </span>
  );
}
