"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, BadgeCheck, Sparkles, Clock } from "lucide-react";

type TrustItem = {
  title: string;
  desc: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type TrustCardMeta = {
  icon: React.ComponentType<{ className?: string }>;
};

const ICONS: ReadonlyArray<TrustCardMeta> = [
  { icon: BadgeCheck },
  { icon: ShieldCheck },
  { icon: Sparkles },
  { icon: Clock },
];

export default function TrustStrip({ items }: { items: ReadonlyArray<TrustItem> }) {
  return (
    <section className="relative -mt-6 pb-10 sm:pb-14">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-[26px] border border-stone bg-white/70 p-4 shadow-sm backdrop-blur sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.slice(0, 4).map((it, idx) => {
              const Icon = ICONS[idx]?.icon ?? BadgeCheck;

              return (
                <motion.div
                  key={it.title}
                  className="group rounded-3xl border border-stone bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                  initial={{ y: 16, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(idx * 0.06, 0.22),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-midnight">{it.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink/80">{it.desc}</p>

                      {it.ctaHref && it.ctaLabel ? (
                        <Link
                          href={it.ctaHref}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-midnight transition hover:text-brand"
                        >
                          {it.ctaLabel}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="pointer-events-none mt-4 h-px w-full bg-gradient-to-r from-brand/25 via-stone to-transparent" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Soft background plate like Tourm sections */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-40 w-[92%] -translate-x-1/2 rounded-[2.5rem] bg-white/40 blur-[0px]" />
      </div>
    </section>
  );
}
