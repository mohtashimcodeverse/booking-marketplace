"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PhoneCall } from "lucide-react";

export default function OwnerCta({
  title,
  subtitle,
  bullets,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  bullets: ReadonlyArray<string>;
  imageUrl?: string;
}) {
  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          className="grid overflow-hidden rounded-[36px] border border-stone bg-white shadow-card lg:grid-cols-2"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* LEFT — CONTENT */}
          <div className="relative p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand/12 blur-3xl" />
              <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-midnight/10 blur-3xl" />
            </div>

            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                For owners
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
                {title}
              </h2>

              <p className="mt-3 text-sm text-ink/75 sm:text-base">
                {subtitle}
              </p>

              <ul className="mt-7 space-y-3">
                {bullets.slice(0, 5).map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-ink/80">
                    <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-2xl bg-sand">
                      <CheckCircle2 className="h-4 w-4 text-brand" />
                    </span>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/owners"
                  className="inline-flex items-center rounded-full bg-midnight px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-midnight/90"
                >
                  Explore owner services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-stone bg-white px-6 py-3 text-sm font-extrabold text-midnight shadow-sm transition hover:bg-sand"
                >
                  Talk to our team
                  <PhoneCall className="ml-2 h-4 w-4 text-ink/60" />
                </Link>
              </div>

              <div className="mt-8 rounded-3xl border border-stone bg-sand/70 p-5">
                <p className="text-sm font-extrabold text-midnight">
                  Operator-grade management, not just a listing.
                </p>
                <p className="mt-1 text-xs text-ink/75">
                  After booking confirmation, ops tasks (cleaning, inspection, linen, restock) are auto-created by the platform.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — IMAGE */}
          <div className="relative min-h-[320px] lg:min-h-full">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Owner services"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone to-white" />
            )}

            <div className="absolute inset-0 bg-gradient-to-tr from-midnight/65 via-midnight/25 to-transparent" />

            <motion.div
              className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/25 bg-white/15 p-5 text-white backdrop-blur-md"
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.45, delay: 0.12 }}
            >
              <p className="text-sm font-extrabold">
                Managed stays, better reviews, higher occupancy.
              </p>
              <p className="mt-1 text-xs text-white/80">
                We operate your property like a hotel — you stay in control.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Cleaning", "Inspection", "Linen", "Restock"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
