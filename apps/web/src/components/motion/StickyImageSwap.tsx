"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ensureGsap } from "@/lib/gsap";

type Item = {
  title: string;
  desc: string;
  imageUrl: string;
};

export default function StickyImageSwap({
  items,
  className,
}: {
  items: Item[];
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const gsap = ensureGsap();
    const wrap = wrapRef.current;
    if (!wrap) return;

    const panels = Array.from(
      wrap.querySelectorAll<HTMLElement>("[data-panel]")
    );

    const kills = panels.map((panel, idx) => {
      const st = gsap.to(panel, {
        scrollTrigger: {
          trigger: panel,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActive(idx),
          onEnterBack: () => setActive(idx),
        },
      });
      return () => st.scrollTrigger?.kill();
    });

    return () => kills.forEach((k) => k());
  }, []);

  return (
    <section ref={wrapRef} className={className}>
      <div className="lux-container grid gap-10 md:grid-cols-2 md:items-start">
        {/* Left: scroll panels */}
        <div className="space-y-6">
          {items.map((it, idx) => (
            <div
              key={idx}
              data-panel
              className={`rounded-4xl border p-6 transition ${
                idx === active
                  ? "border-black/15 bg-white shadow-card"
                  : "border-black/10 bg-white"
              }`}
            >
              <div className="font-heading text-2xl text-ink">{it.title}</div>
              <p className="mt-2 text-sm text-gray-600">{it.desc}</p>
            </div>
          ))}
        </div>

        {/* Right: sticky image */}
        <div className="md:sticky md:top-24">
          <div className="rounded-4xl border border-black/10 bg-white p-4 shadow-card">
            <div className="relative h-[520px] overflow-hidden rounded-4xl">
              <Image
                key={items[active]?.imageUrl}
                src={items[active]?.imageUrl}
                alt={items[active]?.title ?? "Showcase"}
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
