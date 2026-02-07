"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, Search, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

type Step = {
  step: string;
  title: string;
  desc: string;
};

type StepIcon = {
  Icon: React.ComponentType<{ className?: string }>;
};

const ICONS: ReadonlyArray<StepIcon> = [
  { Icon: Search },
  { Icon: MapPin },
  { Icon: CalendarDays },
  { Icon: ShieldCheck },
  { Icon: Sparkles },
  { Icon: CheckCircle2 },
];

export default function HowItWorks({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle: string;
  steps: ReadonlyArray<Step>;
}) {
  const list = steps.slice(0, 6);

  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">{subtitle}</p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2.5 w-2.5 rounded-full bg-brand" />
            <div className="h-2.5 w-2.5 rounded-full bg-stone" />
            <div className="h-2.5 w-2.5 rounded-full bg-stone" />
          </div>
        </div>

        {/* Tourm-like process cards */}
        <div className="relative mt-10">
          {/* faint connector line behind cards (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent lg:block" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s, idx) => {
              const Icon = ICONS[idx]?.Icon ?? Sparkles;

              return (
                <motion.div
                  key={`${s.step}-${s.title}`}
                  className="group relative rounded-3xl border border-stone bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                  initial={{ y: 18, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(idx * 0.06, 0.24),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Step badge */}
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sand">
                        <span className="text-sm font-extrabold text-midnight">{s.step}</span>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                          Step {s.step}
                        </p>
                        <p className="mt-1 text-lg font-extrabold leading-snug text-midnight">
                          {s.title}
                        </p>
                      </div>
                    </div>

                    {/* Icon bubble */}
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-stone bg-white">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-ink/75">{s.desc}</p>

                  <div className="mt-5 h-px w-full bg-gradient-to-r from-brand/25 via-stone to-transparent" />

                  {/* Small accent dot like Tourm */}
                  <div className="pointer-events-none absolute -top-2 right-6 h-3 w-3 rounded-full bg-brand opacity-0 transition group-hover:opacity-100" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* section background plate */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-44 w-[92%] -translate-x-1/2 rounded-[2.75rem] border border-stone bg-white/40" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -right-24 bottom-14 h-72 w-72 rounded-full bg-midnight/10 blur-3xl" />
      </div>
    </section>
  );
}
