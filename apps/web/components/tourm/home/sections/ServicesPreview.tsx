"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Brush, ClipboardCheck, Shirt, PackageOpen, ArrowRight } from "lucide-react";

type Service = {
  title: string;
  desc: string;
};

type ServiceIcon = {
  Icon: React.ComponentType<{ className?: string }>;
};

const ICONS: ReadonlyArray<ServiceIcon> = [
  { Icon: Brush }, // Cleaning
  { Icon: ClipboardCheck }, // Inspection
  { Icon: Shirt }, // Linen
  { Icon: PackageOpen }, // Restock
];

export default function ServicesPreview({
  title,
  subtitle,
  services,
}: {
  title: string;
  subtitle: string;
  services: ReadonlyArray<Service>;
}) {
  const list = services.slice(0, 4);

  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
              Operator services
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">{subtitle}</p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border border-stone bg-white px-5 py-3 text-sm font-extrabold text-midnight shadow-sm transition hover:bg-sand"
          >
            View services
            <ArrowRight className="h-4 w-4 text-ink/70" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s, idx) => {
            const Icon = ICONS[idx]?.Icon ?? Sparkles;

            return (
              <motion.div
                key={s.title}
                className="group rounded-3xl border border-stone bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
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
                  <div className="grid h-12 w-12 place-items-center rounded-3xl bg-sand">
                    <Icon className="h-6 w-6 text-brand" />
                  </div>

                  <div className="h-3 w-3 rounded-full bg-brand/30 opacity-0 transition group-hover:opacity-100" />
                </div>

                <p className="mt-4 text-base font-extrabold text-midnight">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{s.desc}</p>

                <div className="mt-5 h-px w-full bg-gradient-to-r from-brand/25 via-stone to-transparent" />

                <div className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-midnight/80">
                  Built into operations
                  <span aria-hidden className="text-ink/50">
                    →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute left-10 bottom-10 h-64 w-64 rounded-full bg-midnight/10 blur-3xl" />
      </div>
    </section>
  );
}
