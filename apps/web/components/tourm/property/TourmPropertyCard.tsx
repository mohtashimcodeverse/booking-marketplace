"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchResponse } from "@/lib/types/search";
import { useCurrency } from "@/lib/currency/CurrencyProvider";

type Item = SearchResponse["items"][number];

type Slide = {
  key: string;
  url: string;
  alt: string;
};

type DragState = {
  pointerId: number | null;
  down: boolean;
  moved: boolean;
  startX: number;
  startLeft: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function TourmPropertyCard({ item }: { item: Item }) {
  const title = item.title ?? "Stay";
  const area = item.location?.area ?? null;
  const city = item.location?.city ?? null;
  const meta = [area, city].filter(Boolean).join(" • ");

  const guests = item.capacity?.maxGuests ?? null;
  const beds = item.capacity?.bedrooms ?? null;
  const baths = item.capacity?.bathrooms ?? null;

  const { currency, formatFromAed, formatBaseAed } = useCurrency();
  const baseNightly = item.pricing?.nightly ?? null;
  const price = baseNightly === null ? null : formatFromAed(baseNightly);
  const basePriceHint =
    currency !== "AED" && baseNightly !== null ? `Base: ${formatBaseAed(baseNightly)}` : null;

  const slides = useMemo<Slide[]>(() => {
    const output: Slide[] = [];
    const seen = new Set<string>();

    for (const media of item.media ?? []) {
      const url = (media.url ?? "").trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      output.push({
        key: `${url}#${media.sortOrder}`,
        url,
        alt: (media.alt ?? title).trim() || title,
      });
    }

    const cover = item.coverImage?.url?.trim();
    if (cover && !seen.has(cover)) {
      output.unshift({
        key: `${cover}#cover`,
        url: cover,
        alt: (item.coverImage?.alt ?? title).trim() || title,
      });
    }

    return output;
  }, [item.coverImage?.alt, item.coverImage?.url, item.media, title]);

  const railRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>({
    pointerId: null,
    down: false,
    moved: false,
    startX: 0,
    startLeft: 0,
  });

  const suppressClickRef = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideCount = slides.length;
  const hasMultipleSlides = slideCount > 1;

  const scrollToIndex = useCallback(
    (nextIndex: number, behavior: ScrollBehavior = "smooth") => {
      const rail = railRef.current;
      if (!rail || slideCount <= 0) return;

      const clamped = clamp(nextIndex, 0, slideCount - 1);
      rail.scrollTo({ left: clamped * rail.clientWidth, behavior });
    },
    [slideCount],
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let raf = 0;

    const updateActive = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const next = Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1));
        setActiveIndex(clamp(next, 0, Math.max(0, slideCount - 1)));
      });
    };

    rail.addEventListener("scroll", updateActive, { passive: true });
    updateActive();

    return () => {
      rail.removeEventListener("scroll", updateActive);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [slideCount]);

  useEffect(() => {
    if (!hasMultipleSlides || !isHovered || isDragging) return;

    const timer = window.setInterval(() => {
      const next = (activeIndex + 1) % slideCount;
      scrollToIndex(next);
    }, 1650);

    return () => window.clearInterval(timer);
  }, [activeIndex, hasMultipleSlides, isDragging, isHovered, scrollToIndex, slideCount]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onResize = () => scrollToIndex(activeIndex, "auto");
    window.addEventListener("resize", onResize, { passive: true });

    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, scrollToIndex]);

  const onRailPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasMultipleSlides) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const rail = railRef.current;
    if (!rail) return;

    dragRef.current.pointerId = e.pointerId;
    dragRef.current.down = true;
    dragRef.current.moved = false;
    dragRef.current.startX = e.clientX;
    dragRef.current.startLeft = rail.scrollLeft;

    setIsDragging(false);
    rail.setPointerCapture(e.pointerId);
  }, [hasMultipleSlides]);

  const onRailPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !dragRef.current.down) return;

    const dx = e.clientX - dragRef.current.startX;

    if (!dragRef.current.moved && Math.abs(dx) > 6) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragRef.current.moved) {
      rail.scrollLeft = dragRef.current.startLeft - dx;
    }
  }, []);

  const endDrag = useCallback((e?: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !dragRef.current.down) return;

    if (e && dragRef.current.pointerId !== null && rail.hasPointerCapture(dragRef.current.pointerId)) {
      rail.releasePointerCapture(dragRef.current.pointerId);
    }

    dragRef.current.pointerId = null;
    dragRef.current.down = false;

    if (dragRef.current.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 180);

      window.setTimeout(() => setIsDragging(false), 120);
      window.setTimeout(() => scrollToIndex(Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1))), 80);
      return;
    }

    setIsDragging(false);
  }, [scrollToIndex]);

  return (
    <article className="premium-card premium-card-hover group relative overflow-hidden rounded-2xl border-line-strong shadow-card">
      <div className="relative aspect-[5/4] w-full overflow-hidden">
        {slideCount > 0 ? (
          <div
            ref={railRef}
            className={[
              "no-scrollbar flex h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory",
              isDragging ? "cursor-grabbing" : hasMultipleSlides ? "cursor-grab" : "cursor-default",
            ].join(" ")}
            style={{ touchAction: hasMultipleSlides ? "pan-y pinch-zoom" : "auto" }}
            onPointerDown={onRailPointerDown}
            onPointerMove={onRailPointerMove}
            onPointerUp={(e) => endDrag(e)}
            onPointerCancel={(e) => endDrag(e)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {slides.map((slide, idx) => (
              <Link
                key={slide.key}
                href={`/properties/${item.slug}`}
                className="relative h-full w-full shrink-0 snap-start"
                onClick={(e) => {
                  if (!suppressClickRef.current) return;
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-label={`${title} photo ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.url}
                  alt={slide.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  loading="lazy"
                  draggable={false}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-warm-alt to-warm-base" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/42 via-ink/10 to-transparent opacity-90" />

        {price ? (
          <div className="absolute left-3 top-3 rounded-xl border border-line bg-brand-soft px-3 py-2 text-xs font-semibold text-primary backdrop-blur">
            {price} <span className="font-normal text-secondary">/ night</span>
            {basePriceHint ? (
              <div className="mt-1 text-[10px] font-medium text-secondary">{basePriceHint}</div>
            ) : null}
          </div>
        ) : null}

        {item.flags?.instantBook ? (
          <div className="absolute right-3 top-3 rounded-xl border border-line bg-surface/95 px-3 py-2 text-xs font-semibold text-primary shadow-sm">
            Instant book
          </div>
        ) : null}

        {hasMultipleSlides ? (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((slide, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={[
                    "rounded-full transition",
                    active ? "h-1.5 w-5 bg-surface" : "h-1.5 w-1.5 bg-surface/55 hover:bg-surface/80",
                  ].join(" ")}
                  aria-label={`Show image ${idx + 1}`}
                />
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="space-y-2.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-primary">
            <Link href={`/properties/${item.slug}`} className="transition hover:text-secondary">
              {title}
            </Link>
          </h3>
        </div>

        {meta ? <p className="text-sm text-secondary">{meta}</p> : <div className="h-5" />}

        <div className="flex flex-wrap gap-2 pt-1">
          {guests ? (
            <span className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-primary transition group-hover:bg-brand-soft-2">
              {guests} guests
            </span>
          ) : null}
          {beds ? (
            <span className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-primary transition group-hover:bg-brand-soft-2">
              {beds} beds
            </span>
          ) : null}
          {baths ? (
            <span className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-primary transition group-hover:bg-brand-soft-2">
              {baths} baths
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
