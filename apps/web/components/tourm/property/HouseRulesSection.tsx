import type { ComponentType } from "react";
import {
  CigaretteOff,
  Users,
  PartyPopper,
  Dog,
  IdCard,
  Volume2,
  Clock,
  Sparkles,
  CircleHelp,
} from "lucide-react";

export type HouseRuleKey =
  | "NO_SMOKING"
  | "NO_PARTIES"
  | "QUIET_HOURS"
  | "ID_REQUIRED"
  | "NO_PETS"
  | "MAX_GUESTS"
  | "CHECKIN_WINDOW"
  | "CHECKOUT_TIME"
  | "KEEP_CLEAN"
  | "OTHER";

export type HouseRuleItem = {
  key: HouseRuleKey | string;
  label?: string;
  detail?: string;
};

type RuleMeta = {
  key: HouseRuleKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

const RULES: Record<HouseRuleKey, RuleMeta> = {
  NO_SMOKING: { key: "NO_SMOKING", label: "No smoking", Icon: CigaretteOff },
  NO_PARTIES: { key: "NO_PARTIES", label: "No parties or events", Icon: PartyPopper },
  QUIET_HOURS: { key: "QUIET_HOURS", label: "Quiet hours", Icon: Volume2 },
  ID_REQUIRED: { key: "ID_REQUIRED", label: "ID required at check-in", Icon: IdCard },
  NO_PETS: { key: "NO_PETS", label: "No pets", Icon: Dog },
  MAX_GUESTS: { key: "MAX_GUESTS", label: "Max guests", Icon: Users },
  CHECKIN_WINDOW: { key: "CHECKIN_WINDOW", label: "Check-in window", Icon: Clock },
  CHECKOUT_TIME: { key: "CHECKOUT_TIME", label: "Check-out time", Icon: Clock },
  KEEP_CLEAN: { key: "KEEP_CLEAN", label: "Keep the space tidy", Icon: Sparkles },
  OTHER: { key: "OTHER", label: "House rule", Icon: CircleHelp },
};

function normalizeRuleKey(input: string): HouseRuleKey {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "_");
  return Object.prototype.hasOwnProperty.call(RULES, cleaned)
    ? (cleaned as HouseRuleKey)
    : "OTHER";
}

function metaFor(rule: HouseRuleItem) {
  const key = typeof rule.key === "string" ? normalizeRuleKey(rule.key) : "OTHER";
  const meta = RULES[key];
  const label = (rule.label ?? "").trim() || meta.label;
  const detail = (rule.detail ?? "").trim() || undefined;
  return { meta, label, detail };
}

export type HouseRulesSectionProps = {
  title?: string;
  items: HouseRuleItem[];
};

export default function HouseRulesSection({
  title = "House rules",
  items,
}: HouseRulesSectionProps) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-xs text-slate-600">
        Clear, structured rules for a smooth stay.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((r, idx) => {
          const { meta, label, detail } = metaFor(r);
          const Icon = meta.Icon;

          return (
            <div
              key={`${String(r.key)}-${idx}`}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <Icon className="h-5 w-5 text-slate-700" />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{label}</div>
                {detail ? (
                  <div className="mt-0.5 text-xs text-slate-600">{detail}</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
