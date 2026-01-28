"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ensureGsap } from "@/lib/gsap";

const imgHero =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80";
const imgSmall =
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=80";

export default function HeroLux() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hx",
        { y: 18, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          stagger: 0.08,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".hero-card",
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-[#0F1720] text-white">
      {/* Luxivo-ish atmospheric background */}
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08)_0%,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.06)_0%,transparent_48%),radial-gradient(circle_at_70%_90%,rgba(107,124,92,0.16)_0%,transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:60px_60px]" />
      <div className="pointer-events-none absolute -left-28 top-32 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -top-20 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 pb-28 md:px-6 md:pt-20 md:pb-36">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* LEFT COPY */}
          <div className="relative">
            <div className="hx inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#6B7C5C]" />
              Luxury stays • Full-service management
            </div>

            <h1 className="hx mt-6 text-[46px] leading-[1.05] tracking-[-0.02em] md:text-[64px]">
              <span className="font-[600] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Luxury stays,
              </span>
              <br />
              <span className="font-[600] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                professionally
              </span>{" "}
              <span className="font-[600] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                managed.
              </span>
            </h1>

            <p className="hx mt-5 max-w-xl text-sm text-white/70 md:text-base">
              For owners: maximize revenue with pricing, cleaning, guest support, and maintenance.
              For guests: book premium, consistently managed homes.
            </p>

            <div className="hx mt-8 flex flex-wrap gap-3">
              <Link
                href="/owners"
                className="rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_60px_rgba(17,24,39,0.20)] hover:bg-[#5C6E4F]"
              >
                Get a revenue estimate →
              </Link>
              <Link
                href="/properties"
                className="rounded-2xl border border-white/18 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Browse stays →
              </Link>
            </div>

            {/* stats / features row */}
            <div className="hx mt-10 grid max-w-xl grid-cols-3 gap-3">
              <Stat title="24/7" desc="Guest support" />
              <Stat title="Smart" desc="Pricing & occupancy" />
              <Stat title="Premium" desc="Cleaning & quality" />
            </div>
          </div>

          {/* RIGHT LAYERED IMAGES */}
          <div className="relative">
            <div className="hero-card relative ml-auto w-[92%] rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur md:w-[88%]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
                <Image
                  src={imgHero}
                  alt="Luxury apartment"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>

            <div className="hero-card absolute -left-1 bottom-[-34px] w-[62%] rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
                <Image
                  src={imgSmall}
                  alt="Premium living space"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IMPORTANT: bigger fade so next section doesn’t look “cut” */}
      <div className="pointer-events-none h-24 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}

function Stat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-white/65">{desc}</div>
    </div>
  );
}
