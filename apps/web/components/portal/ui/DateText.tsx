function safeDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function DateText(props: { value: unknown; mode?: "date" | "datetime" }) {
  const d = safeDate(props.value);
  if (!d) return <span className="text-muted">—</span>;

  const formatted =
    props.mode === "datetime"
      ? d.toLocaleString()
      : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });

  return <span className="text-primary">{formatted}</span>;
}
