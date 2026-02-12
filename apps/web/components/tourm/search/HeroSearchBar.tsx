"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";

type Draft = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
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

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export default function HeroSearchBar() {
  const router = useRouter();

  const [draft, setDraft] = useState<Draft>({
    location: "",
    checkIn: todayISO(),
    checkOut: "",
    guests: 2,
  });

  const canSearch = useMemo(() => {
    return draft.guests >= 1 && draft.guests <= 16 && draft.checkIn.length > 0;
  }, [draft.guests, draft.checkIn]);

  function go() {
    const p = new URLSearchParams();

    const loc = draft.location.trim();
    const preset = matchPreset(loc);

    // If preset matches, use exact filters (best UX)
    if (preset) {
      p.set("city", "Dubai");
      p.set("area", preset);
    } else if (loc.length > 0) {
      p.set("q", loc);
    }

    p.set("guests", String(clampInt(draft.guests, 1, 16)));
    if (draft.checkIn) p.set("checkIn", draft.checkIn);
    if (draft.checkOut) p.set("checkOut", draft.checkOut);

    router.push(`/properties?${p.toString()}`);
  }

  return (
    <motion.div
      className="relative z-20 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
    >
      <div className="premium-card premium-card-tinted rounded-[2.25rem] p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.7fr_0.6fr] lg:items-center">
          <div className="premium-input flex items-center gap-3 rounded-3xl px-4 py-3">
            <MapPin className="h-4 w-4 text-secondary" />
            <input
              value={draft.location}
              onChange={(e) => setDraft((s) => ({ ...s, location: e.target.value }))}
              placeholder="Dubai Marina, Downtown, JBR, Al Barsha…"
              className="w-full bg-transparent text-sm font-medium text-primary outline-none placeholder:text-muted"
              aria-label="Location"
            />
          </div>

          <div className="premium-input flex items-center gap-3 rounded-3xl px-4 py-3">
            <CalendarDays className="h-4 w-4 text-secondary" />
            <input
              type="date"
              value={draft.checkIn}
              onChange={(e) => setDraft((s) => ({ ...s, checkIn: e.target.value }))}
              className="w-full bg-transparent text-sm font-medium text-primary outline-none"
              aria-label="Check-in date"
            />
          </div>

          <div className="premium-input flex items-center gap-3 rounded-3xl px-4 py-3">
            <CalendarDays className="h-4 w-4 text-secondary" />
            <input
              type="date"
              value={draft.checkOut}
              onChange={(e) => setDraft((s) => ({ ...s, checkOut: e.target.value }))}
              className="w-full bg-transparent text-sm font-medium text-primary outline-none"
              aria-label="Check-out date"
            />
          </div>

          <div className="premium-input flex items-center gap-3 rounded-3xl px-4 py-3">
            <Users className="h-4 w-4 text-secondary" />
            <input
              type="number"
              min={1}
              max={16}
              value={draft.guests}
              onChange={(e) => setDraft((s) => ({ ...s, guests: Number(e.target.value) }))}
              className="w-full bg-transparent text-sm font-medium text-primary outline-none"
              aria-label="Guests"
            />
          </div>

          <button
            type="button"
            onClick={go}
            disabled={!canSearch}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-accent-text shadow-brand-soft transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </button>
        </div>

        <div className="mt-3 px-2 text-[12px] text-secondary">
          Tip: type an area like “Dubai Marina” or “Downtown Dubai” for exact area filtering.
        </div>
      </div>
    </motion.div>
  );
}
