"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchPropertyCard } from "@/lib/api/publicTypes";

type FeaturedSpotlightProps = {
  title: string;
  subtitle: string;
  items: ReadonlyArray<SearchPropertyCard>;
};

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount === null) return "";
  const c = (currency ?? "").trim();
  try {
    const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
    return c ? `${nf.format(amount)} ${c}` : nf.format(amount);
  } catch {
    return c ? `${amount} ${c}` : String(amount);
  }
}

function safeText(v: string | null | undefined): string {
  return (v ?? "").trim();
}

type DragState = {
  down: boolean;
  moved: boolean;
  startX: number;
  startLeft: number;
};

function useDragScroller() {
  const ref = useRef<HTMLDivElement | null>(null);
  const st = useRef<DragState>({
    down: false,
    moved: false,
    startX: 0,
    startLeft: 0,
  });

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onDown(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      st.current.down = true;
      st.current.moved = false;
      st.current.startX = e.clientX;
      st.current.startLeft = el.scrollLeft;
      setDragging(false);

      el.classList.add("cursor-grabbing");
      el.classList.remove("cursor-grab");
    }

    function onMove(e: PointerEvent) {
      if (!st.current.down) return;

      const dx = e.clientX - st.current.startX;

      if (!st.current.moved && Math.abs(dx) > 6) {
        st.current.moved = true;
        setDragging(true);
      }

      if (st.current.moved) {
        el.scrollLeft = st.current.startLeft - dx;
      }
    }

    function onUp() {
      if (!st.current.down) return;
      st.current.down = false;

      el.classList.remove("cursor-grabbing");
      el.classList.add("cursor-grab");

      if (st.current.moved) {
        window.setTimeout(() => setDragging(false), 120);
      } else {
        setDragging(false);
      }
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const didDrag = () => st.current.moved;

  return { ref, dragging, didDrag };
}

type ClickIntent = {
  downAt: number;
  downX: number;
  downY: number;
};

export default function FeaturedSpotlight(props: FeaturedSpotlightProps) {
  const router = useRouter();
  const list = props.items.slice(0, 12);

  const snapIds = useMemo(() => list.map((it) => `featured_${it.id}`), [list]);
  const initialIdx = useMemo(
    () => (list.length ? Math.floor(list.length / 2) : 0),
    [list.length],
  );

  const { ref: scrollerRef, dragging, didDrag } = useDragScroller();
  const [activeIdx, setActiveIdx] = useState<number>(initialIdx);

  const clickIntent = useRef<ClickIntent | null>(null);

  function centerToIdxNoVertical(idx: number) {
    const el = scrollerRef.current;
    if (!el) return;

    const max = Math.max(0, snapIds.length - 1);
    const clamped = Math.max(0, Math.min(idx, max));
    const target = el.querySelector<HTMLElement>(`#${snapIds[clamped]}`);
    if (!target) return;

    // HARD RULE: never use scrollIntoView. Only horizontal math.
    // Use offsetLeft math (no viewport/rect math required).
    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    const elCenter = el.clientWidth / 2;
    const nextLeft = Math.max(0, targetCenter - elCenter);
    el.scrollLeft = nextLeft;
  }

  function scrollToIdx(idx: number) {
    const el = scrollerRef.current;
    if (!el) return;

    const max = Math.max(0, snapIds.length - 1);
    const clamped = Math.max(0, Math.min(idx, max));
    const target = el.querySelector<HTMLElement>(`#${snapIds[clamped]}`);
    if (!target) return;

    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    const elCenter = el.clientWidth / 2;
    const nextLeft = Math.max(0, targetCenter - elCenter);

    el.scrollTo({ left: nextLeft, behavior: "smooth" });
  }

  // Start centered (middle active) — WITHOUT scrolling the page vertically.
  useEffect(() => {
    if (!list.length) return;
    setActiveIdx(initialIdx);

    // double RAF ensures layout is stable (prevents any accidental jank)
    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(() => {
        centerToIdxNoVertical(initialIdx);
      });
      window.cancelAnimationFrame(raf2);
    });

    return () => window.cancelAnimationFrame(raf1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIdx, list.length]);

  // Active index from closest-to-center.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;

    function onScroll() {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;

        const centerX = el.scrollLeft + el.clientWidth / 2;

        let best = 0;
        let bestDist = Number.POSITIVE_INFINITY;

        for (let i = 0; i < snapIds.length; i += 1) {
          const node = el.querySelector<HTMLElement>(`#${snapIds[i]}`);
          if (!node) continue;
          const nodeCenter = node.offsetLeft + node.offsetWidth / 2;
          const d = Math.abs(centerX - nodeCenter);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }

        setActiveIdx(best);
      });
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [snapIds]);

  function onCardPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    clickIntent.current = { downAt: Date.now(), downX: e.clientX, downY: e.clientY };
  }

  function onCardPointerUp(slug: string, e: React.PointerEvent<HTMLDivElement>) {
    const intent = clickIntent.current;
    clickIntent.current = null;

    if (didDrag()) return;

    if (!intent) return;
    const dx = Math.abs(e.clientX - intent.downX);
    const dy = Math.abs(e.clientY - intent.downY);
    const dt = Date.now() - intent.downAt;

    if (dx <= 6 && dy <= 6 && dt <= 900) {
      router.push(`/properties/${slug}`);
    }
  }

  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
              Featured
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              {props.title}
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">{props.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-full border border-stone bg-white px-5 py-3 text-sm font-extrabold text-midnight shadow-sm transition hover:bg-sand"
            >
              View all stays
              <ArrowRight className="h-4 w-4 text-ink/70" />
            </Link>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollToIdx(activeIdx - 1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-stone bg-white shadow-sm transition hover:bg-sand"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-midnight" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIdx(activeIdx + 1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-stone bg-white shadow-sm transition hover:bg-sand"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-midnight" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-10 rounded-[32px] border border-stone bg-white/55 p-4 shadow-[0_18px_60px_rgba(2,10,20,0.08)] backdrop-blur sm:p-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 rounded-[32px] bg-gradient-to-r from-white/90 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 rounded-[32px] bg-gradient-to-l from-white/90 to-transparent" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-midnight/65 text-white shadow-[0_18px_55px_rgba(2,10,20,0.35)] backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em]">
                <ArrowLeft className="h-4 w-4 text-white/90" />
                DRAG
                <ArrowRight className="h-4 w-4 text-white/90" />
              </div>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="no-scrollbar cursor-grab overflow-x-auto scroll-smooth"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="flex items-stretch gap-6 pr-10">
              <div className="w-[14vw] shrink-0 sm:w-[18vw]" />

              {list.map((it, idx) => {
                const isActive = idx === activeIdx;

                const city = safeText(it.city);
                const area = safeText(it.area);
                const loc = area ? `${area}${city ? `, ${city}` : ""}` : city;

                const title = safeText(it.title) || "Stay";
                const cover = safeText(it.coverImageUrl);
                const price = formatMoney(it.priceFrom, it.currency);

                const heightClass = isActive
                  ? "h-[440px] sm:h-[500px]"
                  : "h-[410px] sm:h-[470px]";

                const widthClass = isActive
                  ? "w-[78vw] max-w-[560px] sm:w-[560px]"
                  : "w-[62vw] max-w-[470px] sm:w-[470px]";

                const visualClass = isActive
                  ? "scale-[1.02] opacity-100"
                  : "scale-[0.94] opacity-70 blur-[1.2px]";

                return (
                  <div
                    key={it.id}
                    id={snapIds[idx]}
                    className={[
                      "relative shrink-0 overflow-hidden rounded-[34px] border border-stone bg-white shadow-[0_16px_55px_rgba(2,10,20,0.10)] transition-transform duration-300 ease-out",
                      widthClass,
                      visualClass,
                      dragging ? "select-none" : "",
                    ].join(" ")}
                    style={{ scrollSnapAlign: "center" }}
                    onPointerDown={onCardPointerDown}
                    onPointerUp={(e) => onCardPointerUp(it.slug, e)}
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${title}`}
                  >
                    <div className={["relative w-full", heightClass].join(" ")}>
                      {cover ? (
                        <Image
                          src={cover}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 80vw, 560px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-stone to-white" />
                      )}

                      {!isActive ? <div className="absolute inset-0 bg-white/10 backdrop-blur-[3px]" /> : null}

                      <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/10 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                        <div className="flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-lg font-extrabold text-white sm:text-xl">
                              {title}
                            </p>
                            <p className="mt-1 truncate text-sm text-white/80">{loc || "Dubai"}</p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {it.guests ? (
                                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
                                  Up to {it.guests} guests
                                </span>
                              ) : null}
                              {it.bedrooms ? (
                                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
                                  {it.bedrooms} bed
                                </span>
                              ) : null}
                              {it.bathrooms ? (
                                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
                                  {it.bathrooms} bath
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {price ? (
                              <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-white backdrop-blur">
                                <div className="text-xs font-bold text-white/75">from</div>
                                <div className="text-sm font-extrabold">{price}</div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-white/85 backdrop-blur">
                                <div className="text-xs font-bold">View</div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 text-xs font-bold text-white/80">
                          Click to open property →
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="w-[14vw] shrink-0 sm:w-[18vw]" />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {list.slice(0, 8).map((it, idx) => (
              <button
                key={it.id}
                type="button"
                onClick={() => scrollToIdx(idx)}
                className={[
                  "h-2.5 rounded-full transition",
                  idx === activeIdx ? "w-8 bg-brand" : "w-2.5 bg-stone",
                ].join(" ")}
                aria-label={`Go to featured ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-midnight/10 blur-3xl" />
      </div>
    </section>
  );
}
