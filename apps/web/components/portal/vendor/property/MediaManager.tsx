"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { VendorPropertyDetail, VendorPropertyMedia } from "@/lib/api/portal/vendor";
import {
  reorderVendorPropertyMedia,
  updateVendorPropertyMediaCategory,
  uploadVendorPropertyMedia,
} from "@/lib/api/portal/vendor";
import type { MediaCategory } from "@/lib/types/property";

const REQUIRED_BLOCKS: Array<{ key: MediaCategory; title: string; help: string }> = [
  { key: "LIVING_ROOM", title: "Living room", help: "Required category" },
  { key: "BEDROOM", title: "Bedroom", help: "Required category" },
  { key: "BATHROOM", title: "Bathroom", help: "Required category" },
  { key: "KITCHEN", title: "Kitchen", help: "Required category" },
];

const ALL_CATEGORIES: MediaCategory[] = [
  "COVER",
  "LIVING_ROOM",
  "BEDROOM",
  "BATHROOM",
  "KITCHEN",
  "DINING",
  "BALCONY",
  "AMENITIES",
  "BUILDING",
  "VIEW",
  "OTHER",
];

type Props = {
  property: VendorPropertyDetail;
  onChanged: (next: VendorPropertyDetail) => void;
};

function sortByOrder(a: VendorPropertyMedia, b: VendorPropertyMedia) {
  return a.sortOrder - b.sortOrder;
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function isMediaCategory(v: string): v is MediaCategory {
  return (ALL_CATEGORIES as readonly string[]).includes(v);
}

function labelCategory(c: MediaCategory): string {
  // Make enums look human without changing backend truth
  return c
    .toLowerCase()
    .split("_")
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeIncomingCategory(v: string): MediaCategory {
  // Defensive: if backend ever sends an unknown category, we render as OTHER (never crash)
  const cleaned = (v ?? "").trim().toUpperCase();
  return isMediaCategory(cleaned) ? (cleaned as MediaCategory) : "OTHER";
}

export function MediaManager({ property, onChanged }: Props) {
  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const [otherCategory, setOtherCategory] = useState<MediaCategory>("OTHER");

  // key -> input element
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const media = useMemo(() => [...(property.media ?? [])].sort(sortByOrder), [property.media]);

  const grouped = useMemo(() => {
    const map = new Map<MediaCategory, VendorPropertyMedia[]>();
    for (const m of media) {
      const k = normalizeIncomingCategory(m.category);
      const arr = map.get(k) ?? [];
      arr.push(m);
      map.set(k, arr);
    }
    return map;
  }, [media]);

  function clearInput(key: string) {
    const el = inputsRef.current[key];
    if (el) el.value = "";
  }

  async function uploadAndTag(files: FileList | null, category: MediaCategory) {
    if (!files || files.length === 0) return;

    setError(null);
    setBusy(`Uploading to ${category}...`);

    try {
      const created: VendorPropertyMedia[] = [];

      // 1) upload
      for (const file of Array.from(files)) {
        const item = await uploadVendorPropertyMedia(property.id, file);
        created.push(item);
      }

      // 2) tag each uploaded media to requested category
      const tagged: VendorPropertyMedia[] = [];
      for (const item of created) {
        const updated = await updateVendorPropertyMediaCategory(property.id, item.id, category);
        tagged.push(updated);
      }

      // 3) merge into local state (replace created with tagged)
      const createdIds = new Set(created.map((x) => x.id));
      const nextMedia = [...(property.media ?? []).filter((m) => !createdIds.has(m.id)), ...tagged];

      onChanged({ ...property, media: nextMedia });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function setCategory(mediaId: string, category: MediaCategory) {
    setError(null);
    setBusy("Updating category...");

    try {
      const updated = await updateVendorPropertyMediaCategory(property.id, mediaId, category);
      onChanged({
        ...property,
        media: (property.media ?? []).map((m) => (m.id === updated.id ? updated : m)),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function move(mediaId: string, dir: -1 | 1) {
    const ordered = [...media];
    const idx = ordered.findIndex((m) => m.id === mediaId);
    if (idx < 0) return;

    const j = idx + dir;
    if (j < 0 || j >= ordered.length) return;

    const tmp = ordered[idx];
    ordered[idx] = ordered[j];
    ordered[j] = tmp;

    const ids = ordered.map((m) => m.id);

    setError(null);
    setBusy("Reordering...");

    try {
      const rows = await reorderVendorPropertyMedia(property.id, ids);
      onChanged({ ...property, media: rows });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setBusy(null);
    }
  }

  function UploadBlock(props: {
    category: MediaCategory;
    title: string;
    help: string;
    accent?: "required" | "optional";
  }) {
    const count = grouped.get(props.category)?.length ?? 0;

    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-slate-900">{props.title}</div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                  props.accent === "required"
                    ? "bg-amber-50 text-amber-800 ring-amber-200"
                    : "bg-slate-50 text-slate-700 ring-slate-200"
                )}
              >
                {props.help}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">{count} uploaded</div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={(el) => {
                inputsRef.current[props.category] = el;
              }}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id={`upload-${props.category}`}
              onChange={(e) => {
                const files = e.target.files;
                void uploadAndTag(files, props.category);
                clearInput(props.category);
              }}
            />
            <label
              htmlFor={`upload-${props.category}`}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Upload
            </label>
          </div>
        </div>
      </div>
    );
  }

  const otherCategoryOptions = useMemo(() => {
    const requiredSet = new Set<MediaCategory>(["LIVING_ROOM", "BEDROOM", "BATHROOM", "KITCHEN"]);
    return ALL_CATEGORIES.filter((c) => !requiredSet.has(c));
  }, []);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Photos</h3>
            <p className="mt-1 text-sm text-slate-600">
              Upload photos in the correct sections. Required categories:
              <span className="font-medium"> LIVING_ROOM, BEDROOM, BATHROOM, KITCHEN</span>.
              Optional categories are available for balcony, view, building, amenities, etc.
            </p>
          </div>
        </div>

        {busy ? (
          <div className="mt-4 rounded-xl border border-black/10 bg-[#f6f3ec] p-3 text-sm text-slate-700">
            {busy}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      {/* Required upload blocks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {REQUIRED_BLOCKS.map((b) => (
          <UploadBlock key={b.key} category={b.key} title={b.title} help={b.help} accent="required" />
        ))}

        {/* Other uploader with selectable category */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-slate-900">Other photos</div>
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  Optional
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">Upload cover, balcony, view, amenities, building, etc.</div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={otherCategory}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isMediaCategory(v)) setOtherCategory(v);
                }}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {otherCategoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {labelCategory(c)}
                  </option>
                ))}
              </select>

              <input
                ref={(el) => {
                  inputsRef.current["OTHER_UPLOADER"] = el;
                }}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="upload-other"
                onChange={(e) => {
                  const files = e.target.files;
                  void uploadAndTag(files, otherCategory);
                  clearInput("OTHER_UPLOADER");
                }}
              />
              <label
                htmlFor="upload-other"
                className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Upload
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">All photos</div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((m, idx) => {
            const safeCategory = normalizeIncomingCategory(m.category);

            return (
              <div key={m.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="relative aspect-[4/3] w-full bg-[#f6f3ec]">
                  <Image
                    src={m.url}
                    alt={m.alt ?? `Photo ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                    #{m.sortOrder}
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                    {safeCategory}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="text-xs font-semibold text-slate-600">Change category</div>

                  <select
                    value={safeCategory}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isMediaCategory(v)) void setCategory(m.id, v);
                    }}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-900"
                    disabled={busy !== null}
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {labelCategory(c)}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => void move(m.id, -1)}
                      disabled={busy !== null || m.sortOrder === 0}
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => void move(m.id, 1)}
                      disabled={busy !== null || idx === media.length - 1}
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Down
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Tip: set your best image as <span className="font-medium">Cover</span>.
                  </p>
                </div>
              </div>
            );
          })}

          {media.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/20 bg-[#f6f3ec] p-6 text-sm text-slate-700">
              No photos yet. Upload at least 4 images and tag the required room categories.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
