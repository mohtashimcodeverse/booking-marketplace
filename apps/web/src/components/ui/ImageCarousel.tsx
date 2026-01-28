"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

type Slide = { src: string; alt: string; tag?: string };

export default function ImageCarousel({
  slides,
  className,
}: {
  slides: Slide[];
  className?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-4xl border border-black/10 bg-white shadow-card" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, idx) => (
            <div key={idx} className="min-w-0 flex-[0_0_85%] md:flex-[0_0_40%] p-4">
              <div className="relative h-[320px] overflow-hidden rounded-4xl">
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                {s.tag ? (
                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
                    {s.tag}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === selected ? "bg-lux-olive" : "bg-black/20"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
