"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";

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
    "https://images.unsplash.com/photo-1546412414-8035e1776c9a?auto=format&fit=crop&w=2200&q=84";

  const primaryCtaHref = safeHref(props.primaryCtaHref, "/properties");
  const primaryCtaLabel = props.primaryCtaLabel ?? "Explore stays";

  const secondaryCtaHref = safeHref(props.secondaryCtaHref, "/owners");
  const secondaryCtaLabel = props.secondaryCtaLabel ?? "List your property";

  return (
    <section className="relative -mt-[76px] w-full overflow-hidden bg-[#F8FAFC] pt-[76px] sm:-mt-[80px] sm:pt-[80px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(248,250,252,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(248,250,252,0.14)_1px,transparent_1px)] [background-size:38px_38px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <div className="relative grid items-stretch gap-0 overflow-hidden rounded-[2rem] border border-white/24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white shadow-[0_26px_70px_rgba(11,15,25,0.30)] backdrop-blur-[2px] lg:grid-cols-[1.08fr_1.22fr]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(248,250,252,0.08),transparent_42%,rgba(248,250,252,0.04)_100%)]" />

          <motion.div
            className="relative overflow-hidden bg-white/8 px-6 pb-8 pt-8 sm:px-10"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_-6%,rgba(248,250,252,0.12),transparent_58%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-[rgba(79,70,229,0.14)] px-3 py-1 text-xs font-semibold text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-white/95" />
                Verified availability • Operator-managed stays
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {titleTop} <span className="text-white">{titleEmphasis}</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                {subtitle}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0F19] shadow-[0_12px_32px_rgba(11,15,25,0.25)] transition hover:bg-indigo-50"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/60 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {secondaryCtaLabel}
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { k: "24/7", v: "Guest support", Icon: Clock3 },
                  { k: "Clean", v: "Hotel-grade", Icon: Sparkles },
                  { k: "Real", v: "Live inventory", Icon: ShieldCheck },
                ].map((it) => (
                  <div
                    key={it.k}
                    className="rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-grid h-7 w-7 place-items-center rounded-lg border border-[#C6A96D]/40 bg-[rgba(198,169,109,0.20)] text-[#C6A96D]">
                        <it.Icon className="h-4 w-4" />
                      </span>
                      <div className="text-sm font-semibold text-[#0B0F19]">{it.k}</div>
                    </div>
                    <div className="mt-1 text-xs text-[#0B0F19]/74">{it.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="group relative overflow-hidden bg-white/8 p-3 sm:p-4 lg:p-5"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full min-h-[300px] overflow-hidden rounded-[1.65rem] border border-white/24 sm:min-h-[360px]">
              <Image
                src={heroImageUrl}
                alt="Dubai stay"
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
