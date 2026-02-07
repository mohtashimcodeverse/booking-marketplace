"use client";

import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/portal/ui/Modal";

type Tone = "neutral" | "danger" | "success" | "warning";

function toneClasses(tone: Tone): { iconBg: string; iconColor: string; primaryBtn: string } {
  if (tone === "danger") {
    return {
      iconBg: "bg-rose-50",
      iconColor: "text-rose-700",
      primaryBtn: "bg-rose-600 text-white hover:bg-rose-700",
    };
  }
  if (tone === "success") {
    return {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      primaryBtn: "bg-emerald-600 text-white hover:bg-emerald-700",
    };
  }
  if (tone === "warning") {
    return {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-800",
      primaryBtn: "bg-slate-900 text-white hover:bg-slate-800",
    };
  }
  return {
    iconBg: "bg-slate-50",
    iconColor: "text-slate-700",
    primaryBtn: "bg-slate-900 text-white hover:bg-slate-800",
  };
}

export function ConfirmDialog(props: {
  open: boolean;
  title: string;
  description?: ReactNode;

  tone?: Tone;

  confirmText?: string;
  cancelText?: string;

  confirmDisabled?: boolean;
  busy?: boolean;

  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const tone = props.tone ?? "neutral";
  const ui = toneClasses(tone);

  return (
    <Modal
      open={props.open}
      onClose={props.onCancel}
      title={props.title}
      subtitle="Please confirm this action."
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={props.onCancel}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            {props.cancelText ?? "Cancel"}
          </button>
          <button
            type="button"
            disabled={props.confirmDisabled || props.busy}
            onClick={() => void props.onConfirm()}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-60",
              ui.primaryBtn,
            ].join(" ")}
          >
            {props.busy ? "Working…" : props.confirmText ?? "Confirm"}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <div className={["flex h-11 w-11 items-center justify-center rounded-2xl", ui.iconBg].join(" ")}>
          {tone === "success" ? (
            <CheckCircle2 className={["h-5 w-5", ui.iconColor].join(" ")} />
          ) : (
            <AlertTriangle className={["h-5 w-5", ui.iconColor].join(" ")} />
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{props.title}</div>
          {props.description ? (
            <div className="mt-1 text-sm text-slate-600">{props.description}</div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
