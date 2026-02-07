function safeNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function MoneyText(props: { amount: unknown; currency?: unknown }) {
  const n = safeNumber(props.amount);
  const c = typeof props.currency === "string" && props.currency.trim().length > 0 ? props.currency.trim() : null;

  if (n === null) return <span className="text-slate-500">—</span>;

  const formatted = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return (
    <span className="font-semibold text-slate-900">
      {formatted} {c ?? ""}
    </span>
  );
}
