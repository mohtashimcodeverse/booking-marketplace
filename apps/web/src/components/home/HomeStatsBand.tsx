"use client";

import ScrollReveal from "@/components/motion/ScrollReveal";

const STATS = [
  { num: "24/7", label: "Guest support" },
  { num: "Smart", label: "Pricing & occupancy" },
  { num: "Premium", label: "Cleaning & quality" },
  { num: "Fast", label: "Issue resolution" },
];

export default function HomeStatsBand() {
  return (
    <section className="bg-[#0F1720]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div data-sr className="grid gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur"
              >
                <div className="text-4xl text-white [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                  {s.num}
                </div>
                <div className="mt-1 text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
