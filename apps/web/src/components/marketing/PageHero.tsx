"use client";

import ScrollReveal from "@/components/motion/ScrollReveal";

export default function PageHero({
  kicker,
  title,
  desc,
}: {
  kicker: string;
  title: string;
  desc?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0F1720] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08)_0%,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.06)_0%,transparent_48%),radial-gradient(circle_at_70%_90%,rgba(107,124,92,0.16)_0%,transparent_48%)]" />
      <div className="pointer-events-none absolute -left-28 top-28 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -top-20 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <ScrollReveal variant="fadeUp" stagger={0.08} start="top 90%">
          <div data-sr className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#6B7C5C]" />
            {kicker}
          </div>

          <h1
            data-sr
            className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-6xl"
          >
            {title}
          </h1>

          {desc ? (
            <p data-sr className="mt-4 max-w-2xl text-sm text-white/70 md:text-base">
              {desc}
            </p>
          ) : null}
        </ScrollReveal>
      </div>

      <div className="pointer-events-none h-16 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}
