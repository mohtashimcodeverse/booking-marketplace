"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type HeroSplitProps = {
  titleTop?: string;
  titleEmphasis?: string;
  subtitle?: string;
  heroImageUrl?: string;

  primaryCtaHref?: string;
  primaryCtaLabel?: string;

  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
};

function safeHref(v: string | undefined, fallback: string): string {
  const s = (v ?? "").trim();
  return s.length > 0 ? s : fallback;
}

export default function HeroSplit(props: HeroSplitProps) {
  const titleTop = props.titleTop ?? "Premium stays in";
  const titleEmphasis = props.titleEmphasis ?? "Dubai & UAE";
  const subtitle =
    props.subtitle ??
    "Live availability, transparent pricing, and operator-grade hospitality — aligned with our backend booking engine.";

  const heroImageUrl =
    props.heroImageUrl ??
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=2400&q=80";

  const primaryCtaHref = safeHref(props.primaryCtaHref, "/properties");
  const primaryCtaLabel = props.primaryCtaLabel ?? "Explore stays";

  const secondaryCtaHref = safeHref(props.secondaryCtaHref, "/owners");
  const secondaryCtaLabel = props.secondaryCtaLabel ?? "List your property";

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background (Tourm-ish) */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-sand" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
          <div className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute -right-28 top-24 h-[560px] w-[560px] rounded-full bg-brand/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-midnight/10 blur-3xl" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          {/* Left panel — solid #16A6C8 */}
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-stone bg-[#16A6C8] px-6 pb-8 pt-8 shadow-card sm:px-10"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              {/* Badge — WHITE background (requested) */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white px-3 py-1 text-xs font-semibold text-midnight shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-[#16A6C8]" />
                Verified availability • Operator-managed stays
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {titleTop} <span className="text-white">{titleEmphasis}</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                {subtitle}
              </p>

              {/* Buttons — both white */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-midnight shadow-sm transition hover:bg-white/95"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-midnight shadow-sm transition hover:bg-white/95"
                >
                  {secondaryCtaLabel}
                </Link>
              </div>

              {/* Stat cards — white */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { k: "24/7", v: "Guest support" },
                  { k: "Clean", v: "Hotel-grade" },
                  { k: "Real", v: "Live inventory" },
                ].map((it) => (
                  <div
                    key={it.k}
                    className="rounded-2xl border border-white/60 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(2,10,20,0.10)]"
                  >
                    <div className="text-sm font-semibold text-midnight">{it.k}</div>
                    <div className="text-xs text-midnight/70">{it.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right image panel — NO “Book with confidence” overlay (removed) */}
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-stone bg-white shadow-card"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0">
              <Image src={heroImageUrl} alt="Dubai stay" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="h-10 sm:h-12" />
    </section>
  );
}
