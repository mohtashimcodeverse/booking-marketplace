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

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80",
] as const;

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
  const trio = [images.a, images.b, images.c].map((src, idx) => src ?? FALLBACK_IMAGES[idx]);

  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Aligned image trio */}
          <motion.div
            className="relative"
            initial={{ y: 18, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative mx-auto w-full max-w-[650px]">
              <motion.div
                className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.9rem] border border-inverted/70 bg-surface shadow-[0_20px_58px_rgba(11,15,25,0.16)]"
                initial={{ y: 12, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={trio[0]}
                  alt="Why choose us visual 1"
                  fill
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/34 via-transparent to-transparent" />
              </motion.div>

              <motion.div
                className="absolute -left-4 top-6 hidden w-[34%] min-w-[170px] overflow-hidden rounded-[1.35rem] border border-inverted/70 bg-surface shadow-[0_16px_40px_rgba(11,15,25,0.16)] sm:block"
                initial={{ y: 12, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={trio[1]}
                    alt="Why choose us visual 2"
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-4 hidden w-[38%] min-w-[180px] overflow-hidden rounded-[1.35rem] border border-inverted/70 bg-surface shadow-[0_16px_40px_rgba(11,15,25,0.16)] sm:block"
                initial={{ y: 12, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative aspect-[5/4] w-full">
                  <Image
                    src={trio[2]}
                    alt="Why choose us visual 3"
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
                </div>
              </motion.div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
                {[trio[1], trio[2]].map((src, idx) => (
                  <div
                    key={`${src}-mobile-${idx}`}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.15rem] border border-inverted/70 bg-surface shadow-soft"
                  >
                    <Image
                      src={src}
                      alt={`Why choose us visual ${idx + 2}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Soft glow behind imagery */}
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-brand/10 blur-3xl" />
          </motion.div>

          {/* Copy */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/60">
              Why us
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-secondary/75 sm:text-base">{subtitle}</p>

            <div className="mt-8 space-y-4">
              {reasons.slice(0, 4).map((r, idx) => (
                <motion.div
                  key={r.title}
                  className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-3xl p-5"
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
                    <div className="card-icon-plate h-10 w-10 shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-primary">{r.title}</p>
                      <p className="mt-1 text-sm text-secondary/75">{r.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.slice(0, 4).map((s, idx) => (
                <motion.div
                  key={s.label}
                  className={[
                    "rounded-3xl p-5",
                    idx === 0
                      ? "premium-card premium-card-dark"
                      : "premium-card premium-card-tinted premium-card-hover card-accent-left",
                  ].join(" ")}
                  initial={{ y: 14, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(idx * 0.05, 0.2),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                  <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-secondary/60">
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
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-dark-1/10 blur-3xl" />
      </div>
    </section>
  );
}
