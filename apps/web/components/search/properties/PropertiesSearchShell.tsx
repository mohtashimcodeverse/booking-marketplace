"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchResponse, MapPoint } from "@/lib/types/search";
import type { PropertiesQuery } from "@/lib/search/params";
import { buildPropertiesSearchParams, stableStringifyQuery, withPage, withResetPage } from "@/lib/search/params";
import { searchMapViewport } from "@/lib/api/search";
import GoogleMap from "@/components/maps/GoogleMap";
import TourmPropertyCard from "@/components/tourm/property/TourmPropertyCard";
import FiltersPanel from "@/components/search/properties/PropertiesFiltersPanel";
import PinPreviewCard from "@/components/search/properties/PinPreviewCard";

type Props = {
  query: PropertiesQuery;
  items: SearchResponse["items"];
  meta: SearchResponse["meta"] | null;
};

type Bounds = { north: number; south: number; east: number; west: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function defaultCenterFromItems(items: SearchResponse["items"]) {
  const first = items.find((x) => typeof x.location?.lat === "number" && typeof x.location?.lng === "number");
  if (first?.location?.lat && first?.location?.lng) return { lat: first.location.lat, lng: first.location.lng };
  // Dubai-ish default (safe fallback)
  return { lat: 25.2048, lng: 55.2708 };
}

function defaultZoom(items: SearchResponse["items"]) {
  const withCoords = items.filter((x) => x.location?.lat && x.location?.lng);
  return withCoords.length > 0 ? 11 : 10;
}

export default function PropertiesSearchShell(props: Props) {
  const router = useRouter();

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // keep a ref to current query to avoid stale closures in viewport fetch
  const queryRef = useRef<PropertiesQuery>(props.query);
  queryRef.current = props.query;

  const qKey = useMemo(() => stableStringifyQuery(props.query), [props.query]);

  const center = useMemo(() => defaultCenterFromItems(props.items), [props.items]);
  const zoom = useMemo(() => defaultZoom(props.items), [props.items]);

  const cardLookup = useMemo(() => {
    const m = new Map<string, SearchResponse["items"][number]>();
    for (const it of props.items) m.set(it.slug, it);
    return m;
  }, [props.items]);

  const pushQuery = useCallback(
    (next: PropertiesQuery) => {
      const sp = buildPropertiesSearchParams(next);
      router.push(`/properties?${sp.toString()}`);
    },
    [router],
  );

  const onChangeFilters = useCallback(
    (partial: Partial<PropertiesQuery>) => {
      const next: PropertiesQuery = withResetPage({
        ...props.query,
        ...partial,
        pageSize: props.query.pageSize,
      });
      pushQuery(next);
    },
    [props.query, pushQuery],
  );

  const onGoToPage = useCallback(
    (page: number) => {
      pushQuery(withPage(props.query, page));
    },
    [props.query, pushQuery],
  );

  const fetchViewport = useCallback(
    async (b: Bounds) => {
      const q = queryRef.current;

      // backend has viewport safety limits; we also clamp absurd values
      const north = clamp(b.north, -85, 85);
      const south = clamp(b.south, -85, 85);
      const east = clamp(b.east, -180, 180);
      const west = clamp(b.west, -180, 180);

      setMapLoading(true);
      setMapError(null);

      const res = await searchMapViewport({
        north,
        south,
        east,
        west,
        checkIn: q.checkIn,
        checkOut: q.checkOut,
        guests: q.guests,
        city: q.city,
        area: q.area,
        q: q.q,
        minPrice: q.minPrice,
        maxPrice: q.maxPrice,
        amenities: q.amenities,
      });

      if (!res.ok) {
        setMapError(res.message || "Failed to load map pins");
        setMapPoints([]);
        setMapLoading(false);
        return;
      }

      setMapPoints(res.data.points);
      setMapLoading(false);
    },
    [],
  );

  const onMarkerClick = useCallback((slug: string) => {
    setActiveSlug(slug);
    // if the pin exists in current list, scroll to it
    const el = document.querySelector(`[data-slug="${slug}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const activeItem = useMemo(() => {
    if (!activeSlug) return null;
    return cardLookup.get(activeSlug) ?? null;
  }, [activeSlug, cardLookup]);

  const totalPages = props.meta?.totalPages ?? 1;
  const page = props.meta?.page ?? props.query.page;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      {/* LEFT: Filters + Results */}
      <div className="space-y-5">
        <FiltersPanel
          query={props.query}
          resultsCount={props.meta?.total ?? null}
          onChange={onChangeFilters}
          busyKey={qKey}
        />

        {/* Results header */}
        <div className="flex items-end justify-between gap-3">
          <div className="text-sm text-white/70">
            {props.meta ? (
              <>
                Showing{" "}
                <span className="font-semibold text-white">{props.items.length}</span> of{" "}
                <span className="font-semibold text-white">{props.meta.total}</span>
              </>
            ) : (
              "Browse stays"
            )}
          </div>
        </div>

        {/* Results grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {props.items.map((it) => (
            <div
              key={it.id}
              data-slug={it.slug}
              onMouseEnter={() => setHoveredSlug(it.slug)}
              onMouseLeave={() => setHoveredSlug((s) => (s === it.slug ? null : s))}
            >
              <TourmPropertyCard item={it} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {props.meta && totalPages > 1 ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }).slice(0, 10).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onGoToPage(p)}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm transition",
                    active
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]",
                  ].join(" ")}
                >
                  {p}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* RIGHT: Map */}
      <div className="lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="text-sm font-semibold text-white">Map</div>
            <div className="text-xs text-white/60">
              {mapLoading ? "Updating pins…" : mapError ? "Pins unavailable" : `${mapPoints.length} pins`}
            </div>
          </div>

          <div className="relative">
            <GoogleMap
              center={center}
              zoom={zoom}
              points={mapPoints}
              hoveredSlug={hoveredSlug}
              activeSlug={activeSlug}
              onMarkerClick={onMarkerClick}
              onViewportChanged={fetchViewport}
              viewportDebounceMs={520}
              className="h-[540px] w-full"
            />

            {mapError ? (
              <div className="pointer-events-none absolute inset-x-3 top-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 backdrop-blur">
                {mapError}
              </div>
            ) : null}

            {/* Pin preview card (click pin => show property preview) */}
            {activeItem ? (
              <div className="absolute bottom-3 left-3 right-3">
                <PinPreviewCard
                  item={activeItem}
                  onClose={() => setActiveSlug(null)}
                  onOpen={() => router.push(`/properties/${activeItem.slug}`)}
                />
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-xs text-white/50">
          Pins update when you pan/zoom. Results remain server-driven for pricing + availability truth.
        </p>
      </div>
    </div>
  );
}
