"use client";

function stepTone(current: string, step: "DRAFT" | "UNDER_REVIEW" | "APPROVED"): "done" | "current" | "todo" {
  const s = current.toUpperCase();
  if (step === "DRAFT") return "done";
  if (step === "UNDER_REVIEW") {
    if (s.includes("UNDER_REVIEW")) return "current";
    if (s.includes("APPROV") || s.includes("PUBLISH") || s.includes("CHANGES") || s.includes("REJECT")) return "done";
    return "todo";
  }
  if (step === "APPROVED") {
    if (s.includes("APPROV") || s.includes("PUBLISH")) return "current";
    if (s.includes("CHANGES") || s.includes("REJECT")) return "todo";
    return "todo";
  }
  return "todo";
}

export function VendorPropertyTimeline(props: { status: string }) {
  const current = props.status;

  const steps: Array<{ key: "DRAFT" | "UNDER_REVIEW" | "APPROVED"; title: string; desc: string }> = [
    { key: "DRAFT", title: "Draft", desc: "Fill basic info, upload required photos + docs." },
    { key: "UNDER_REVIEW", title: "In review", desc: "Admin checks listing quality and ownership proof." },
    { key: "APPROVED", title: "Approved", desc: "Listing is approved. Next: publish (later step)." },
  ];

  return (
    <div className="rounded-2xl border bg-surface p-6">
      <div className="text-sm font-semibold text-primary">Status timeline</div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {steps.map((st) => {
          const t = stepTone(current, st.key);
          const cls =
            t === "done"
              ? "border-success/30 bg-success/12"
              : t === "current"
                ? "border-brand bg-warm-alt"
                : "border-line bg-surface";
          return (
            <div key={st.key} className={`rounded-xl border p-4 ${cls}`}>
              <div className="text-xs font-semibold text-secondary">{st.key}</div>
              <div className="mt-1 text-sm font-semibold text-primary">{st.title}</div>
              <div className="mt-1 text-sm text-secondary">{st.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
