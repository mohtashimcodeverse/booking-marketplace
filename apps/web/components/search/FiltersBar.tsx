"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, MapPin, Users, BedDouble, Bath, BadgeDollarSign } from "lucide-react";
import { AMENITY_CATALOG, type AmenityKey } from "@/components/icons/amenities";

type FiltersState = {
  q: string;
  city: string;
  area: string;

  guests: number | "";
  bedrooms: number | "";
  bathrooms: number | "";

  minPrice: number | "";
  maxPrice: number | "";

  amenities: AmenityKey[];
};

const CITY_OPTIONS = [
  { value: "", label: "All cities" },
  { value: "Dubai", label: "Dubai" },
  { value: "Abu Dhabi", label: "Abu Dhabi" },
  { value: "Sharjah", label: "Sharjah" },
];

const DUBAI_PRESETS = [
  "Dubai Marina",
  "Downtown Dubai",
  "JBR",
  "Business Bay",
  "Palm Jumeirah",
  "DIFC",
  "JLT",
  "Al Barsha",
] as const;

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseNumber(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseAmenities(v: string | null): AmenityKey[] {
  if (!v) return [];
  const raw = v
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const out: AmenityKey[] = [];
  for (const r of raw) {
    if (Object.prototype.hasOwnProperty.call(AMENITY_CATALOG, r)) out.push(r as AmenityKey);
  }
  return Array.from(new Set(out));
}

function encodeAmenities(list: AmenityKey[]): string | null {
  const unique = Array.from(new Set(list)).filter(Boolean);
  return unique.length ? unique.join(",") : null;
}

function buildUrl(pathname: string, sp: URLSearchParams) {
  const s = sp.toString();
  return s ? `${pathname}?${s}` : pathname;
}

function setOrDelete(sp: URLSearchParams, key: string, val: string | number | null | undefined) {
  if (val === null || val === undefined) {
    sp.delete(key);
    return;
  }
  const s = String(val).trim();
  if (!s) sp.delete(key);
  else sp.set(key, s);
}

export default function FiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [open, setOpen] = useState(false);

  const fromUrl = useMemo<FiltersState>(() => {
    const q = (sp.get("q") ?? "").trim();
    const city = (sp.get("city") ?? "").trim();
    const area = (sp.get("area") ?? "").trim();

    const guestsN = parseNumber(sp.get("guests"));
    const bedroomsN = parseNumber(sp.get("bedrooms"));
    const bathroomsN = parseNumber(sp.get("bathrooms"));

    const minPriceN = parseNumber(sp.get("minPrice"));
    const maxPriceN = parseNumber(sp.get("maxPrice"));

    const amenities = parseAmenities(sp.get("amenities"));

    return {
      q,
      city,
      area,
      guests: guestsN === null ? "" : clampInt(guestsN, 1, 16),
      bedrooms: bedroomsN === null ? "" : clampInt(bedroomsN, 0, 20),
      bathrooms: bathroomsN === null ? "" : clampInt(bathroomsN, 0, 20),
      minPrice: minPriceN === null ? "" : Math.max(0, minPriceN),
      maxPrice: maxPriceN === null ? "" : Math.max(0, maxPriceN),
      amenities,
    };
  }, [sp]);

  const [draft, setDraft] = useState<FiltersState>(fromUrl);

  useEffect(() => {
    setDraft(fromUrl);
  }, [fromUrl]);

  const activeCount = useMemo(() => {
    let c = 0;
    if (draft.q.trim()) c += 1;
    if (draft.city.trim()) c += 1;
    if (draft.area.trim()) c += 1;
    if (draft.guests !== "") c += 1;
    if (draft.bedrooms !== "") c += 1;
    if (draft.bathrooms !== "") c += 1;
    if (draft.minPrice !== "") c += 1;
    if (draft.maxPrice !== "") c += 1;
    if (draft.amenities.length) c += 1;
    return c;
  }, [draft]);

  function apply(next: FiltersState) {
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.set("page", "1");

    setOrDelete(nextSp, "q", next.q.trim() ? next.q.trim() : null);
    setOrDelete(nextSp, "city", next.city.trim() ? next.city.trim() : null);
    setOrDelete(nextSp, "area", next.area.trim() ? next.area.trim() : null);

    setOrDelete(nextSp, "guests", next.guests === "" ? null : next.guests);
    setOrDelete(nextSp, "bedrooms", next.bedrooms === "" ? null : next.bedrooms);
    setOrDelete(nextSp, "bathrooms", next.bathrooms === "" ? null : next.bathrooms);

    setOrDelete(nextSp, "minPrice", next.minPrice === "" ? null : next.minPrice);
    setOrDelete(nextSp, "maxPrice", next.maxPrice === "" ? null : next.maxPrice);

    const amenitiesStr = encodeAmenities(next.amenities);
    setOrDelete(nextSp, "amenities", amenitiesStr);

    router.push(buildUrl(pathname, nextSp));
  }

  function clearAll() {
    const base = new URLSearchParams(sp.toString());
    for (const k of [
      "q",
      "city",
      "area",
      "guests",
      "bedrooms",
      "bathrooms",
      "minPrice",
      "maxPrice",
      "amenities",
      "page",
    ]) {
      base.delete(k);
    }
    router.push(buildUrl(pathname, base));
  }

  function toggleAmenity(key: AmenityKey) {
    setDraft((s) => {
      const has = s.amenities.includes(key);
      const next = has ? s.amenities.filter((x) => x !== key) : [...s.amenities, key];
      return { ...s, amenities: next };
    });
  }

  function applyPresetArea(area: string) {
    const next: FiltersState = {
      ...draft,
      city: draft.city.trim() ? draft.city : "Dubai",
      area,
    };
    setDraft(next);
    apply(next);
  }

  const amenityKeys = useMemo(() => {
    const keys = Object.keys(AMENITY_CATALOG) as AmenityKey[];
    return keys.filter((k) => k !== "OTHER");
  }, []);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/80 bg-surface/70 p-3 text-primary backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm font-semibold text-primary transition hover:bg-warm-alt"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 ? (
              <span className="ml-1 rounded-lg bg-brand px-2 py-0.5 text-xs font-bold text-accent-text">
                {activeCount}
              </span>
            ) : null}
          </button>

          <div className="hidden flex-wrap gap-2 lg:flex">
            {DUBAI_PRESETS.map((p) => {
              const active = draft.area.trim().toLowerCase() === p.toLowerCase();
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPresetArea(p)}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                    active
                      ? "border-line/80 bg-brand text-accent-text"
                      : "border-line/80 bg-surface text-primary hover:bg-warm-alt",
                  ].join(" ")}
                >
                  <MapPin className="h-3.5 w-3.5 opacity-80" />
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary transition hover:bg-warm-alt"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          ) : (
            <div className="text-xs text-muted">Tip: filters persist on refresh</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-dark-1/40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="absolute right-0 top-0 h-full w-full max-w-[560px] overflow-y-auto border-l border-line/80 bg-surface p-5 text-primary shadow-2xl"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold tracking-tight">Filters</div>
                  <div className="mt-1 text-sm text-secondary">
                    Server-driven results — refresh-safe and backend-truth.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-line/80 bg-surface p-2 transition hover:bg-warm-alt"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-line/80 bg-surface p-4">
                <div className="text-sm font-semibold">Location</div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-xs font-semibold text-secondary">City</div>
                    <select
                      value={draft.city}
                      onChange={(e) => setDraft((s) => ({ ...s, city: e.target.value }))}
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-line/80"
                    >
                      {CITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <div className="mb-1 text-xs font-semibold text-secondary">Area</div>
                    <input
                      value={draft.area}
                      onChange={(e) => setDraft((s) => ({ ...s, area: e.target.value }))}
                      placeholder="e.g. Dubai Marina"
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none placeholder:text-muted focus:border-line/80"
                    />
                  </label>
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-xs font-semibold text-secondary">Dubai presets</div>
                  <div className="flex flex-wrap gap-2">
                    {DUBAI_PRESETS.map((p) => {
                      const active = draft.area.trim().toLowerCase() === p.toLowerCase();
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setDraft((s) => ({ ...s, city: s.city || "Dubai", area: p }))}
                          className={[
                            "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                            active
                              ? "border-line/80 bg-brand text-accent-text"
                              : "border-line/80 bg-surface text-primary hover:bg-warm-alt",
                          ].join(" ")}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 text-xs font-semibold text-secondary">Keyword</div>
                  <input
                    value={draft.q}
                    onChange={(e) => setDraft((s) => ({ ...s, q: e.target.value }))}
                    placeholder="Community, landmark, building…"
                    className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none placeholder:text-muted focus:border-line/80"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line/80 bg-surface p-4">
                <div className="text-sm font-semibold">Guests & rooms</div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-secondary">
                      <Users className="h-4 w-4" /> Guests
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={draft.guests}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        setDraft((s) => ({ ...s, guests: v === "" ? "" : clampInt(Number(v), 1, 16) }));
                      }}
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-line/80"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-secondary">
                      <BedDouble className="h-4 w-4" /> Bedrooms
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={draft.bedrooms}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        setDraft((s) => ({ ...s, bedrooms: v === "" ? "" : clampInt(Number(v), 0, 20) }));
                      }}
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-line/80"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-secondary">
                      <Bath className="h-4 w-4" /> Bathrooms
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={draft.bathrooms}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        setDraft((s) => ({ ...s, bathrooms: v === "" ? "" : clampInt(Number(v), 0, 20) }));
                      }}
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-line/80"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line/80 bg-surface p-4">
                <div className="text-sm font-semibold">Price range</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-secondary">
                      <BadgeDollarSign className="h-4 w-4" /> Min
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={draft.minPrice}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        setDraft((s) => ({ ...s, minPrice: v === "" ? "" : Math.max(0, Number(v)) }));
                      }}
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-line/80"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-secondary">
                      <BadgeDollarSign className="h-4 w-4" /> Max
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={draft.maxPrice}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        setDraft((s) => ({ ...s, maxPrice: v === "" ? "" : Math.max(0, Number(v)) }));
                      }}
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-line/80"
                    />
                  </label>
                </div>

                <div className="mt-2 text-xs text-muted">
                  If backend supports it, results will filter. If not, backend will safely ignore it.
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line/80 bg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">Amenities</div>
                    <div className="mt-1 text-xs text-secondary">Multi-select. Uses the shared catalog.</div>
                  </div>

                  {draft.amenities.length ? (
                    <button
                      type="button"
                      onClick={() => setDraft((s) => ({ ...s, amenities: [] }))}
                      className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-warm-alt"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {amenityKeys.slice(0, 28).map((k) => {
                    const meta = AMENITY_CATALOG[k];
                    const active = draft.amenities.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggleAmenity(k)}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                          active
                            ? "border-line/80 bg-brand text-accent-text"
                            : "border-line/80 bg-surface text-primary hover:bg-warm-alt",
                        ].join(" ")}
                      >
                        <meta.Icon className="h-4 w-4 opacity-80" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-muted">
                  This writes URL param <code className="rounded bg-warm-alt px-1">amenities</code> so refresh/back keeps it.
                </div>
              </div>

              <div className="sticky bottom-0 mt-6 border-t border-line/80 bg-surface pb-2 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="w-full rounded-xl border border-line/80 bg-surface px-4 py-3 text-sm font-semibold text-primary transition hover:bg-warm-alt"
                  >
                    Clear all
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      apply(draft);
                      setOpen(false);
                    }}
                    className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-accent-text transition hover:brightness-95"
                  >
                    Apply filters
                  </button>
                </div>

                <div className="mt-2 text-center text-xs text-muted">
                  Filters are server-driven. No fake UI.
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
