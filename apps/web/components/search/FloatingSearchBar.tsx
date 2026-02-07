"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, CalendarDays, MapPin } from "lucide-react";

type SearchDraft = {
  location: string; // user-facing "location"
  guests: number;
  checkIn: string;
  checkOut: string;
};

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

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchPreset(input: string): string | null {
  const n = normalize(input);
  if (!n) return null;

  for (const p of DUBAI_PRESETS) {
    if (normalize(p) === n) return p;
  }
  return null;
}

export default function FloatingSearchBar(props: { defaultQ?: string }) {
  const router = useRouter();

  const [draft, setDraft] = useState<SearchDraft>({
    // If old code passed defaultQ, treat it as a starting location text
    location: props.defaultQ ?? "",
    guests: 2,
    checkIn: todayISO(),
    checkOut: "",
  });

  const canSearch = useMemo(() => {
    if (!draft.checkIn) return false;
    return draft.guests >= 1 && draft.guests <= 16;
  }, [draft.checkIn, draft.guests]);

  function pushSearch() {
    const p = new URLSearchParams();

    const loc = draft.location.trim();
    const preset = matchPreset(loc);

    // If location matches a known preset, use backend-truth location params
    if (preset) {
      p.set("city", "Dubai");
      p.set("area", preset);
    } else if (loc.length > 0) {
      // Otherwise fall back to backend keyword search `q`
      p.set("q", loc);
    }

    p.set("guests", String(draft.guests));
    if (draft.checkIn) p.set("checkIn", draft.checkIn);
    if (draft.checkOut) p.set("checkOut", draft.checkOut);

    router.push(`/properties?${p.toString()}`);
  }

  function setPreset(preset: string) {
    setDraft((s) => ({ ...s, location: preset }));
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-lg backdrop-blur-md">
        <div className="grid gap-2 md:grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr_0.6fr] md:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <input
              value={draft.location}
              onChange={(e) => setDraft((s) => ({ ...s, location: e.target.value }))}
              placeholder="Dubai Marina, Downtown, JBR, Al Barsha…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              aria-label="Location"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={draft.checkIn}
              onChange={(e) => setDraft((s) => ({ ...s, checkIn: e.target.value }))}
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Check-in date"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={draft.checkOut}
              onChange={(e) => setDraft((s) => ({ ...s, checkOut: e.target.value }))}
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Check-out date"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Users className="h-4 w-4 text-slate-500" />
            <input
              type="number"
              min={1}
              max={16}
              value={draft.guests}
              onChange={(e) => setDraft((s) => ({ ...s, guests: Number(e.target.value) }))}
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Guests"
            />
          </div>

          <button
            type="button"
            onClick={pushSearch}
            disabled={!canSearch}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </button>
        </div>

        {/* Tourm-ish: quick location chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {DUBAI_PRESETS.map((p) => {
            const active = normalize(draft.location) === normalize(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={[
                  "rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
