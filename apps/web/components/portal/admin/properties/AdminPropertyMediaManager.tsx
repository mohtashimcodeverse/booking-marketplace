"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, UploadCloud } from "lucide-react";

import {
  reorderAdminPropertyMedia,
  updateAdminPropertyMediaCategory,
  uploadAdminPropertyMedia,
  type AdminMediaItem,
  type MediaCategory,
} from "@/lib/api/portal/admin";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const ALL_MEDIA_CATEGORIES: MediaCategory[] = [
  "LIVING_ROOM",
  "BEDROOM",
  "BATHROOM",
  "KITCHEN",
  "COVER",
  "DINING",
  "ENTRY",
  "HALLWAY",
  "STUDY",
  "LAUNDRY",
  "BALCONY",
  "TERRACE",
  "VIEW",
  "EXTERIOR",
  "BUILDING",
  "NEIGHBORHOOD",
  "POOL",
  "GYM",
  "PARKING",
  "AMENITY",
  "FLOOR_PLAN",
  "OTHER",
];

function isMediaCategory(v: string): v is MediaCategory {
  return (ALL_MEDIA_CATEGORIES as string[]).includes(v);
}

function SelectField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-700">{props.label}</div>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminPropertyMediaManager(props: {
  propertyId: string;
  initialMedia?: AdminMediaItem[];
  onChange?: (next: AdminMediaItem[]) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("COVER");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [media, setMedia] = useState<AdminMediaItem[]>(props.initialMedia ?? []);
  const sorted = useMemo(() => [...media].sort((a, b) => a.sortOrder - b.sortOrder), [media]);

  function setNext(next: AdminMediaItem[]) {
    setMedia(next);
    props.onChange?.(next);
  }

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy("Uploading...");

    try {
      const created: AdminMediaItem[] = [];
      for (const f of Array.from(files)) {
        const item = await uploadAdminPropertyMedia(props.propertyId, f);
        created.push(item);
      }

      const tagged: AdminMediaItem[] = [];
      for (const it of created) {
        const upd = await updateAdminPropertyMediaCategory(props.propertyId, it.id, selectedCategory);
        tagged.push(upd);
      }

      // Merge with existing (avoid duplicates)
      const createdIds = new Set(created.map((x) => x.id));
      const next = [...sorted.filter((m) => !createdIds.has(m.id)), ...tagged].sort((a, b) => a.sortOrder - b.sortOrder);
      setNext(next);

      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function changeCategory(mediaId: string, category: MediaCategory) {
    setError(null);
    setBusy("Updating category...");
    try {
      const updated = await updateAdminPropertyMediaCategory(props.propertyId, mediaId, category);
      const next = sorted.map((m) => (m.id === updated.id ? updated : m));
      setNext(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function move(mediaId: string, dir: -1 | 1) {
    const arr = [...sorted];
    const i = arr.findIndex((m) => m.id === mediaId);
    if (i < 0) return;

    const j = i + dir;
    if (j < 0 || j >= arr.length) return;

    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;

    const orderedIds = arr.map((m) => m.id);

    setError(null);
    setBusy("Saving order...");
    try {
      const rows = await reorderAdminPropertyMedia(props.propertyId, orderedIds);
      setNext(rows.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setBusy(null);
    }
  }

  // drag reorder
  const [dragId, setDragId] = useState<string | null>(null);

  async function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;

    const arr = [...sorted];
    const from = arr.findIndex((m) => m.id === dragId);
    const to = arr.findIndex((m) => m.id === targetId);
    if (from < 0 || to < 0) return;

    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);

    const orderedIds = arr.map((m) => m.id);

    setError(null);
    setBusy("Saving order...");
    try {
      const rows = await reorderAdminPropertyMedia(props.propertyId, orderedIds);
      setNext(rows.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setBusy(null);
      setDragId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Images</div>
            <div className="mt-1 text-sm text-slate-600">
              Upload images, choose category (including <span className="font-semibold">COVER</span>), and reorder by drag.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SelectField
              label="Upload category"
              value={selectedCategory}
              onChange={(v) => {
                if (isMediaCategory(v)) setSelectedCategory(v);
              }}
              options={ALL_MEDIA_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <div>
              <div className="text-xs font-semibold text-slate-700">Upload</div>
              <div className="mt-1 flex items-center gap-2">
                <input
                  ref={(el) => {
                    inputRef.current = el;
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="admin-create-media-upload"
                  onChange={(e) => void upload(e.target.files)}
                />
                <label
                  htmlFor="admin-create-media-upload"
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload
                </label>
              </div>
            </div>
          </div>
        </div>

        {busy ? (
          <div className="mt-4 rounded-2xl border border-black/10 bg-[#f6f3ec] p-3 text-sm text-slate-700">{busy}</div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/20 bg-[#f6f3ec] p-8 text-sm text-slate-700">
          No images yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((m) => (
            <div
              key={m.id}
              className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden"
              draggable
              onDragStart={() => setDragId(m.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => void dropOn(m.id)}
              title="Drag to reorder"
            >
              <div className="relative aspect-[4/3] bg-[#f6f3ec]">
                <Image src={m.url} alt={m.alt ?? "Media"} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                  <GripVertical className="h-3.5 w-3.5 text-slate-600" />
                  #{m.sortOrder}
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                  {m.category}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-600">Category</div>
                <select
                  value={m.category}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isMediaCategory(v)) void changeCategory(m.id, v);
                  }}
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                  disabled={busy !== null}
                >
                  {ALL_MEDIA_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void move(m.id, -1)}
                    disabled={busy !== null || m.sortOrder === 0}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => void move(m.id, 1)}
                    disabled={busy !== null}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Down
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  Tip: set at least one image as <span className="font-semibold">COVER</span>.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
