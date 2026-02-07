"use client";

import type { VendorPropertyDetail, VendorPropertyDocument } from "@/lib/api/portal/vendor";
import type { MediaCategory } from "@/lib/types/property";

type GateKey = "LOCATION" | "PHOTOS_4" | "CATEGORIES" | "OWNERSHIP_PROOF";

type Gate = {
  key: GateKey;
  ok: boolean;
  title: string;
  detail: string;
};

const REQUIRED_CATEGORIES: MediaCategory[] = ["LIVING_ROOM", "BEDROOM", "BATHROOM", "KITCHEN"];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

type MediaItem = { category: MediaCategory };

function normalizeMedia(v: unknown): MediaItem[] {
  if (!Array.isArray(v)) return [];
  const out: MediaItem[] = [];

  for (const item of v) {
    if (!isRecord(item)) continue;
    const cat = item["category"];
    if (typeof cat !== "string") continue;
    // We trust backend categories. This cast is safe for our app because MediaCategory is the known union.
    out.push({ category: cat as MediaCategory });
  }

  return out;
}

function normalizeDocuments(v: unknown): VendorPropertyDocument[] {
  if (!Array.isArray(v)) return [];
  const out: VendorPropertyDocument[] = [];

  for (const item of v) {
    if (!isRecord(item)) continue;
    const type = item["type"];
    if (typeof type !== "string") continue;
    // Trust backend contract; keep it typed
    out.push(item as VendorPropertyDocument);
  }

  return out;
}

function hasOwnershipProof(docs: VendorPropertyDocument[]): boolean {
  return docs.some((d) => d.type === "OWNERSHIP_PROOF");
}

export function computeGates(p: VendorPropertyDetail): { gates: Gate[]; missingCategories: MediaCategory[] } {
  const raw = p as unknown as { media?: unknown; documents?: unknown };

  const media = normalizeMedia(raw.media);
  const documents = normalizeDocuments(raw.documents);

  const hasLoc = p.lat !== null && p.lng !== null;

  const photoCount = media.length;
  const hasPhotos = photoCount >= 4;

  const present = new Set<MediaCategory>();
  for (const m of media) present.add(m.category);

  const missingCategories = REQUIRED_CATEGORIES.filter((c) => !present.has(c));
  const hasCategories = missingCategories.length === 0;

  const hasDocs = hasOwnershipProof(documents);

  const gates: Gate[] = [
    {
      key: "LOCATION",
      ok: hasLoc,
      title: "Location set",
      detail: hasLoc ? "Map pin saved (lat/lng present)." : "Set city/area/address and map pin (lat/lng).",
    },
    {
      key: "PHOTOS_4",
      ok: hasPhotos,
      title: "At least 4 photos",
      detail: hasPhotos ? `You have ${photoCount} photos.` : `Upload at least 4 photos (currently ${photoCount}).`,
    },
    {
      key: "CATEGORIES",
      ok: hasCategories,
      title: "Required photo categories",
      detail: hasCategories
        ? "Living, Bedroom, Bathroom, Kitchen are present."
        : `Missing: ${missingCategories.join(", ")}`,
    },
    {
      key: "OWNERSHIP_PROOF",
      ok: hasDocs,
      title: "Ownership proof uploaded",
      detail: hasDocs ? "Document found." : "Upload document type: OWNERSHIP_PROOF.",
    },
  ];

  return { gates, missingCategories };
}

function Pill({ ok }: { ok: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        ok
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      ].join(" ")}
    >
      {ok ? "Done" : "Missing"}
    </span>
  );
}

export function ReviewChecklistCard({ property }: { property: VendorPropertyDetail }) {
  const { gates } = computeGates(property);
  const allOk = gates.every((g) => g.ok);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Review readiness</h3>
          <p className="mt-1 text-sm text-neutral-600">
            These are the exact backend gates enforced on <span className="font-medium">Submit for review</span>.
          </p>
        </div>

        <span
          className={[
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            allOk ? "bg-emerald-600 text-white" : "bg-neutral-900 text-white",
          ].join(" ")}
        >
          {allOk ? "Ready" : "Not ready"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {gates.map((g) => (
          <div
            key={g.key}
            className="flex items-start justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-neutral-900">{g.title}</h4>
                <Pill ok={g.ok} />
              </div>
              <p className="mt-1 text-sm text-neutral-600">{g.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
