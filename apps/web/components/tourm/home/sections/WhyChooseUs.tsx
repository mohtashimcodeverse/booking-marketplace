"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type Reason = {
  title: string;
  desc: string;
};

type Stat = {
  label: string;
  value: string; // keep string to avoid formatting assumptions
};

export default function WhyChooseUs({
  title,
  subtitle,
  reasons,
  stats,
  images,
}: {
  title: string;
  subtitle: string;
  reasons: Reason[];
  stats: Stat[];
  images: { a?: string; b?: string; c?: string };
}) {
  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Stacked imagery (Tourm-ish) */}
          <motion.div
            className="relative"
            initial={{ y: 18, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] border border-stone bg-white shadow-card">
              {images.a ? (
                <Image
                  src={images.a}
                  alt="Why choose us"
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-stone to-white" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent" />
            </div>

            {/* Left small card */}
            <motion.div
              className="absolute -bottom-7 -left-2 hidden w-44 overflow-hidden rounded-3xl border border-stone bg-white shadow-card sm:block"
              initial={{ y: 14, opacity: 0, rotate: -4 }}
              whileInView={{ y: 0, opacity: 1, rotate: -2 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[3/4] w-full">
                {images.b ? (
                  <Image
                    src={images.b}
                    alt="Detail"
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-stone to-white" />
                )}
              </div>
            </motion.div>

            {/* Right small card */}
            <motion.div
              className="absolute -top-7 right-2 hidden w-48 overflow-hidden rounded-3xl border border-stone bg-white shadow-card sm:block"
              initial={{ y: 14, opacity: 0, rotate: 4 }}
              whileInView={{ y: 0, opacity: 1, rotate: 2 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/3] w-full">
                {images.c ? (
                  <Image
                    src={images.c}
                    alt="Experience"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-stone to-white" />
                )}
              </div>
            </motion.div>

            {/* Soft glow behind imagery */}
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-brand/10 blur-3xl" />
          </motion.div>

          {/* Copy */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
              Why us
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">{subtitle}</p>

            <div className="mt-8 space-y-4">
              {reasons.slice(0, 4).map((r, idx) => (
                <motion.div
                  key={r.title}
                  className="rounded-3xl border border-stone bg-white p-5 shadow-sm"
                  initial={{ y: 14, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(idx * 0.06, 0.24),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand">
                      <CheckCircle2 className="h-5 w-5 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-midnight">{r.title}</p>
                      <p className="mt-1 text-sm text-ink/75">{r.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.slice(0, 4).map((s, idx) => (
                <motion.div
                  key={s.label}
                  className="rounded-3xl border border-stone bg-white p-5 shadow-sm"
                  initial={{ y: 14, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(idx * 0.05, 0.2),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <p className="text-2xl font-extrabold text-midnight">{s.value}</p>
                  <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-ink/60">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-midnight/10 blur-3xl" />
      </div>
    </section>
  );
}
