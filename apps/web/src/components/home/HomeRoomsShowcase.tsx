"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type Card = {
  title: string;
  tag: string;
  price: string;
  meta: string;
  image: string;
  href: string;
};

export default function HomeRoomsShowcase() {
  const cards: Card[] = useMemo(
    () => [
      {
        title: "Signature Suite",
        tag: "4.9",
        meta: "250 sqm • 3 bed • 3 bathroom",
        price: "AED 950",
        image:
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
        href: "/properties",
      },
      {
        title: "Exclusive Deluxe",
        tag: "4.9",
        meta: "190 sqm • 2 bed • 2 bathroom",
        price: "AED 720",
        image:
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
        href: "/properties",
      },
      {
        title: "Deluxe Family",
        tag: "4.8",
        meta: "220 sqm • 3 bed • 2 bathroom",
        price: "AED 840",
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
        href: "/properties",
      },
      {
        title: "Double Suite",
        tag: "4.8",
        meta: "160 sqm • 2 bed • 2 bathroom",
        price: "AED 640",
        image:
          "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1600&q=80",
        href: "/properties",
      },
    ],
    []
  );

  const rowRef = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);

  function scrollTo(i: number) {
    setIdx(i);
    const el = rowRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 360;
    el.scrollTo({ left: i * (cardWidth + 24), behavior: "smooth" });
  }

  function next() {
    scrollTo(Math.min(cards.length - 1, idx + 1));
  }
  function prev() {
    scrollTo(Math.max(0, idx - 1));
  }

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
              Rooms & Suites
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-4xl">
              Rest in comfort. Select from our suites & rooms.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-600 md:text-base">
              Luxury presentation (Luxivo style) with real property inventory coming from API next.
            </p>
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              onClick={prev}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(17,24,39,0.08)] hover:bg-black/5"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              onClick={next}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(17,24,39,0.08)] hover:bg-black/5"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-10">
          <div
            ref={rowRef}
            className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-4"
          >
            {cards.map((c) => (
              <article
                key={c.title}
                data-card
                className="min-w-[320px] max-w-[360px] flex-1 rounded-[28px] border border-black/10 bg-white p-4 shadow-[0_22px_70px_rgba(17,24,39,0.10)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(17,24,39,0.14)]"
              >
                <div className="relative overflow-hidden rounded-[22px]">
                  <div className="relative h-[210px]">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  </div>

                  <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
                    ★ {c.tag}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-lg font-semibold text-[#111827]">
                    {c.title}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{c.meta}</div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <div className="text-xl font-semibold text-[#111827]">
                        {c.price}
                      </div>
                      <div className="text-xs text-gray-500">per night</div>
                    </div>

                    <Link
                      href={c.href}
                      className="rounded-2xl bg-[#6B7C5C] px-4 py-2 text-xs font-medium text-white hover:bg-[#5C6E4F]"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-3 flex justify-center gap-2 md:hidden">
            <button
              onClick={prev}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
            >
              ← Prev
            </button>
            <button
              onClick={next}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* hide scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
