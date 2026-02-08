"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type AreaChip = {
  title: string;
  q: string; // area name
  imageUrl?: string;
  hint?: string;
};

type Props = {
  title: string;
  subtitle: string;
  areas: AreaChip[];
};

function safeAreas(input: AreaChip[]): AreaChip[] {
  return (input ?? []).filter((a) => a && a.title && a.q);
}

/**
 * Tourm-like center card slider:
 * - Big center card
 * - Side cards tilted + blurred
 * - Auto-advance (not “auto-scroll” page), plus manual arrows
 * - Drag enabled (horizontal)
 */
export default function AreasSlider({ title, subtitle, areas }: Props) {
  const list = useMemo(() => safeAreas(areas), [areas]);
  const [index, setIndex] = useState(0);
  const draggingRef = useRef(false);

  const count = list.length;
  const canRun = count >= 2;

  const clampIndex = useCallback((i: number) => {
    if (count <= 0) return 0;
    const m = ((i % count) + count) % count;
    return m;
  }, [count]);

  const next = useCallback(() => {
    setIndex((i) => clampIndex(i + 1));
  }, [clampIndex]);

  const prev = useCallback(() => {
    setIndex((i) => clampIndex(i - 1));
  }, [clampIndex]);

  useEffect(() => {
    if (!canRun) return;

    const t = window.setInterval(() => {
      if (draggingRef.current) return;
      next();
    }, 3200); // faster like Tourm

    return () => window.clearInterval(t);
  }, [canRun, next]);

  // render 5 cards: [-2,-1,0,+1,+2]
  const slots = useMemo(() => {
    if (!count) return [];
    const offsets = [-2, -1, 0, 1, 2] as const;
    return offsets.map((off) => {
      const idx = clampIndex(index + off);
      return { off, idx, area: list[idx] };
    });
  }, [clampIndex, count, index, list]);

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Areas
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">{subtitle}</p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={prev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_12px_36px_rgba(2,10,20,0.08)] transition hover:bg-slate-50"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_12px_36px_rgba(2,10,20,0.08)] transition hover:bg-slate-50"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="relative h-[420px] overflow-hidden rounded-[2.25rem] border border-[rgba(15,23,42,0.10)] bg-white shadow-[0_18px_60px_rgba(2,10,20,0.10)] sm:h-[470px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(22,166,200,0.14),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(15,23,42,0.10),transparent_52%)]" />

            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence initial={false}>
                {slots.map((s) => {
                  const isCenter = s.off === 0;

                  const x = s.off * 260;
                  const scale =
                    s.off === 0 ? 1 : s.off === -1 || s.off === 1 ? 0.86 : 0.72;

                  const rotate =
                    s.off === 0 ? 0 : s.off < 0 ? -10 + s.off * 1.5 : 10 + s.off * -1.5;

                  const blur =
                    s.off === 0 ? 0 : s.off === -1 || s.off === 1 ? 2.5 : 6;

                  const opacity =
                    s.off === 0 ? 1 : s.off === -1 || s.off === 1 ? 0.55 : 0.25;

                  const zIndex =
                    s.off === 0 ? 30 : s.off === -1 || s.off === 1 ? 20 : 10;

                  const href = `/properties?city=Dubai&area=${encodeURIComponent(s.area.q)}`;

                  return (
                    <motion.div
                      key={`${s.idx}-${s.off}`}
                      className="absolute"
                      style={{ zIndex }}
                      initial={{ opacity: 0, x, scale, rotate }}
                      animate={{ opacity: 1, x, scale, rotate }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      drag="x"
                      dragElastic={0.08}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragStart={() => {
                        draggingRef.current = true;
                      }}
                      onDragEnd={(_, info) => {
                        draggingRef.current = false;
                        const dx = info.offset.x;
                        if (dx > 60) prev();
                        else if (dx < -60) next();
                      }}
                    >
                      <Link
                        href={href}
                        className={[
                          "group block overflow-hidden rounded-[2.25rem] border border-white/15 shadow-[0_22px_80px_rgba(2,10,20,0.18)]",
                          "bg-slate-100",
                        ].join(" ")}
                        style={{
                          width: isCenter ? 520 : 420,
                          height: isCenter ? 360 : 320,
                          filter: blur ? `blur(${blur}px)` : undefined,
                          opacity,
                        }}
                      >
                        <div className="relative h-full w-full">
                          {s.area.imageUrl ? (
                            <Image
                              src={s.area.imageUrl}
                              alt={s.area.title}
                              fill
                              sizes="520px"
                              className="object-cover"
                              priority={isCenter}
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100" />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          <div className="absolute bottom-5 left-5 right-5">
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <p className="text-xl font-semibold text-white">
                                  {s.area.title}
                                </p>
                                {s.area.hint ? (
                                  <p className="mt-1 text-xs font-medium text-white/80">
                                    {s.area.hint}
                                  </p>
                                ) : null}
                              </div>

                              <span className="rounded-2xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition group-hover:bg-white/15">
                                View →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile arrows */}
          <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={prev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_12px_36px_rgba(2,10,20,0.08)]"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_12px_36px_rgba(2,10,20,0.08)]"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
