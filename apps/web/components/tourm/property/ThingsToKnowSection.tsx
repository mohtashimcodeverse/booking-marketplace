import { Clock, ShieldCheck, Receipt, Info, BadgeCheck } from "lucide-react";

export type ThingsToKnowBlock = {
  title: string;
  icon: "CHECKIN" | "SECURITY" | "FEES" | "POLICIES" | "SUPPORT";
  lines: string[];
};

export type ThingsToKnowSectionProps = {
  title?: string;
  blocks: ThingsToKnowBlock[];
};

function IconFor(kind: ThingsToKnowBlock["icon"]) {
  const cls = "h-5 w-5 text-slate-700";
  if (kind === "CHECKIN") return <Clock className={cls} />;
  if (kind === "SECURITY") return <ShieldCheck className={cls} />;
  if (kind === "FEES") return <Receipt className={cls} />;
  if (kind === "SUPPORT") return <BadgeCheck className={cls} />;
  return <Info className={cls} />;
}

export default function ThingsToKnowSection({
  title = "Things to know",
  blocks,
}: ThingsToKnowSectionProps) {
  if (!blocks.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-xs text-slate-600">
        The details that prevent surprises — transparent and guest-friendly.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {blocks.map((b, idx) => (
          <div
            key={`${b.title}-${idx}`}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                {IconFor(b.icon)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{b.title}</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
                  {b.lines.map((line, i) => (
                    <li key={`${line}-${i}`}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
