"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  MapPin,
  User,
  CalendarDays,
  BadgeDollarSign,
  Images,
  Plus,
  X,
  UploadCloud,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { EmptyState } from "@/components/portal/ui/EmptyState";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { DataTable, type Column } from "@/components/portal/ui/DataTable";

import {
  createAdminProperty,
  getAdminProperties,
  getAdminPropertyDetail,
  publishAdminProperty,
  reorderAdminPropertyMedia,
  unpublishAdminProperty,
  updateAdminProperty,
  updateAdminPropertyMediaCategory,
  uploadAdminPropertyMedia,
  type AdminPropertyCreateInput,
  type AdminPropertyDetail,
  type AdminMediaItem,
  type MediaCategory,
} from "@/lib/api/portal/admin";

type AdminPropertiesResponse = Awaited<ReturnType<typeof getAdminProperties>>;
type AdminPropertyRow = AdminPropertiesResponse["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminPropertiesResponse };

type FilterState = {
  q: string;
  status: string;
  city: string;
  sort: "UPDATED_DESC" | "UPDATED_ASC";
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getString(obj: unknown, key: string): string | null {
  const rec = asRecord(obj);
  if (!rec) return null;
  const v = rec[key];
  return typeof v === "string" ? v : null;
}

function getNumber(obj: unknown, key: string): number | null {
  const rec = asRecord(obj);
  if (!rec) return null;
  const v = rec[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function getMediaArray(row: unknown): Array<Record<string, unknown>> {
  const rec = asRecord(row);
  const raw = rec?.media;
  return Array.isArray(raw)
    ? (raw.filter((x) => typeof x === "object" && x !== null) as Array<Record<string, unknown>>)
    : [];
}

function primaryImageUrl(row: unknown): string | null {
  const media = getMediaArray(row);
  if (!media.length) return null;

  const cover = media.find((m) => {
    const cat = (getString(m, "category") ?? "").toUpperCase();
    return cat === "COVER";
  });

  const url1 = cover ? getString(cover, "url") : null;
  if (url1 && url1.trim().length) return url1.trim();

  const sorted = [...media].sort((a, b) => {
    const ao = getNumber(a, "sortOrder") ?? 9999;
    const bo = getNumber(b, "sortOrder") ?? 9999;
    return ao - bo;
  });

  const url2 = getString(sorted[0], "url");
  return url2 && url2.trim().length ? url2.trim() : null;
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function fmtMoney(amount: number | null, currency: string | null): string {
  if (amount === null) return "—";
  const cur = (currency ?? "").trim();
  return cur ? `${amount} ${cur}` : String(amount);
}

function toneForPropertyStatus(status: string): "neutral" | "success" | "warning" | "danger" {
  const s = status.toUpperCase();
  if (s.includes("PUBLISHED")) return "success";
  if (s.includes("UNDER_REVIEW") || s.includes("REVIEW") || s.includes("APPROVED")) return "warning";
  if (s.includes("REJECT") || s.includes("BLOCK")) return "danger";
  return "neutral";
}

function isPublished(status: string): boolean {
  return status.toUpperCase().includes("PUBLISHED");
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

function sourceLabel(row: unknown): "Admin" | "Vendor" {
  const createdByAdminId = getString(row, "createdByAdminId");
  if (createdByAdminId && createdByAdminId.trim().length) return "Admin";
  return "Vendor";
}

function safeTitle(row: unknown): string {
  return getString(row, "title") ?? getString(row, "name") ?? "Untitled";
}

function safeStatus(row: unknown): string {
  return getString(row, "status") ?? "UNKNOWN";
}

function safeCity(row: unknown): string {
  return getString(row, "city") ?? "—";
}

function safeArea(row: unknown): string | null {
  return getString(row, "area");
}

function safeVendor(row: unknown): string {
  return (
    getString(row, "vendorName") ??
    getString(row, "vendorEmail") ??
    getString(row, "vendorId") ??
    getString(row, "ownerId") ??
    "—"
  );
}

function safeUpdatedAt(row: unknown): string | null {
  return getString(row, "updatedAt") ?? getString(row, "createdAt");
}

function safeId(row: unknown): string | null {
  return getString(row, "id");
}

function DrawerShell(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={props.onClose} aria-label="Close drawer" />
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl">
        <div className="border-b border-black/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-900 truncate">{props.title}</div>
              {props.subtitle ? <div className="mt-1 text-sm text-slate-600">{props.subtitle}</div> : null}
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white hover:bg-slate-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-84px)] overflow-auto p-5">{props.children}</div>
      </div>
    </div>
  );
}

function Tabs(props: { value: "DETAILS" | "MEDIA"; onChange: (v: "DETAILS" | "MEDIA") => void }) {
  const items: Array<{ key: "DETAILS" | "MEDIA"; label: string }> = [
    { key: "DETAILS", label: "Details" },
    { key: "MEDIA", label: "Media" },
  ];

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white p-1">
      {items.map((it) => {
        const active = props.value === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => props.onChange(it.key)}
            className={cn(
              "h-10 rounded-2xl px-4 text-sm font-semibold",
              active ? "bg-[#16A6C8] text-white" : "text-slate-800 hover:bg-slate-50"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-700">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        type={props.type ?? "text"}
        className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
      />
      {props.help ? <div className="mt-1 text-xs text-slate-500">{props.help}</div> : null}
    </label>
  );
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

function CheckboxField(props: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[#16A6C8]"
      />
      <div>
        <div className="text-sm font-semibold text-slate-900">{props.label}</div>
        {props.help ? <div className="mt-1 text-xs text-slate-600">{props.help}</div> : null}
      </div>
    </label>
  );
}

function toInt(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function toFloat(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function MediaManagerAdmin(props: {
  propertyId: string;
  media: AdminMediaItem[];
  onMediaChanged: (next: AdminMediaItem[]) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("COVER");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sorted = useMemo(() => [...props.media].sort((a, b) => a.sortOrder - b.sortOrder), [props.media]);

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

      const updated: AdminMediaItem[] = [];
      for (const it of created) {
        const tagged = await updateAdminPropertyMediaCategory(props.propertyId, it.id, selectedCategory);
        updated.push(tagged);
      }

      const createdIds = new Set(created.map((x) => x.id));
      const next = [...sorted.filter((m) => !createdIds.has(m.id)), ...updated].sort((a, b) => a.sortOrder - b.sortOrder);
      props.onMediaChanged(next);
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
      props.onMediaChanged(next);
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
      props.onMediaChanged(rows.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setBusy(null);
    }
  }

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
      props.onMediaChanged(rows.sort((a, b) => a.sortOrder - b.sortOrder));
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
            <div className="text-sm font-semibold text-slate-900">Media Manager</div>
            <div className="mt-1 text-sm text-slate-600">
              Upload images, assign categories (including COVER / VIEW / BALCONY), and reorder. Required categories for vendor review are:{" "}
              <span className="font-semibold">LIVING_ROOM, BEDROOM, BATHROOM, KITCHEN</span>.
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
                  id="admin-media-upload"
                  onChange={(e) => void upload(e.target.files)}
                />
                <label
                  htmlFor="admin-media-upload"
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload images
                </label>
              </div>
            </div>
          </div>
        </div>

        {busy ? <div className="mt-4 rounded-2xl border border-black/10 bg-[#f6f3ec] p-3 text-sm text-slate-700">{busy}</div> : null}
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 whitespace-pre-wrap">{error}</div>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/20 bg-[#f6f3ec] p-8 text-sm text-slate-700">
          No media yet. Upload images and categorize them.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((m) => (
            <div
              key={m.id}
              className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden"
              draggable
              onDragStart={() => setDragId(m.id)}
              onDragOver={(e) => {
                e.preventDefault();
              }}
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
                  You can set multiple images as <span className="font-semibold">COVER</span>.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreatePropertyDrawer(props: { open: boolean; onClose: () => void; onCreated: (row: AdminPropertyDetail) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    title: string;
    slug: string;
    description: string;

    city: string;
    area: string;
    address: string;
    lat: string;
    lng: string;

    maxGuests: string;
    bedrooms: string;
    bathrooms: string;

    basePrice: string;
    cleaningFee: string;
    currency: string;

    minNights: string;
    maxNights: string;

    vendorId: string;
    publishNow: boolean;
  }>({
    title: "",
    slug: "",
    description: "",
    city: "Dubai",
    area: "",
    address: "",
    lat: "",
    lng: "",
    maxGuests: "2",
    bedrooms: "1",
    bathrooms: "1",
    basePrice: "25000",
    cleaningFee: "0",
    currency: "PKR",
    minNights: "1",
    maxNights: "",
    vendorId: "",
    publishNow: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function submit() {
    setError(null);

    const maxGuests = toInt(form.maxGuests);
    const bedrooms = toInt(form.bedrooms);
    const bathrooms = toInt(form.bathrooms);
    const basePrice = toFloat(form.basePrice);
    const cleaningFee = toFloat(form.cleaningFee);
    const lat = toFloat(form.lat);
    const lng = toFloat(form.lng);
    const minNights = toInt(form.minNights);
    const maxNights = toInt(form.maxNights);

    if (!form.title.trim()) return setError("Title is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (!form.city.trim()) return setError("City is required.");
    if (maxGuests === null || maxGuests <= 0) return setError("maxGuests must be a positive number.");
    if (bedrooms === null || bedrooms < 0) return setError("bedrooms must be a valid number.");
    if (bathrooms === null || bathrooms < 0) return setError("bathrooms must be a valid number.");
    if (basePrice === null || basePrice <= 0) return setError("basePrice must be a positive number.");
    if (!form.currency.trim()) return setError("currency is required.");

    const payload: AdminPropertyCreateInput = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() ? form.description.trim() : null,

      city: form.city.trim(),
      area: form.area.trim() ? form.area.trim() : null,
      address: form.address.trim() ? form.address.trim() : null,
      lat: lat === null ? null : lat,
      lng: lng === null ? null : lng,

      maxGuests,
      bedrooms,
      bathrooms,

      basePrice,
      cleaningFee: cleaningFee === null ? null : cleaningFee,
      currency: form.currency.trim(),

      minNights: minNights === null ? null : minNights,
      maxNights: maxNights === null ? null : maxNights,

      vendorId: form.vendorId.trim() ? form.vendorId.trim() : null,
      publishNow: form.publishNow,
    };

    setBusy("Creating property...");
    try {
      const created = await createAdminProperty(payload);
      props.onCreated(created);
      props.onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <DrawerShell open={props.open} title="Create Property" subtitle="Create a new listing as admin (optionally assign to a vendor)." onClose={props.onClose}>
      <div className="space-y-4">
        {busy ? <div className="rounded-2xl border border-black/10 bg-[#f6f3ec] p-3 text-sm text-slate-700">{busy}</div> : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 whitespace-pre-wrap">{error}</div>
        ) : null}

        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Basics</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Title" value={form.title} onChange={(v) => update("title", v)} placeholder="e.g., Marina View Apartment" />
            <TextField label="Slug" value={form.slug} onChange={(v) => update("slug", v)} placeholder="e.g., marina-view-apartment" help="Must be unique." />
            <div className="sm:col-span-2">
              <TextField label="Description" value={form.description} onChange={(v) => update("description", v)} placeholder="Short description (optional)" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Location</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="City" value={form.city} onChange={(v) => update("city", v)} placeholder="Dubai" />
            <TextField label="Area" value={form.area} onChange={(v) => update("area", v)} placeholder="City Walk" />
            <div className="sm:col-span-2">
              <TextField label="Address" value={form.address} onChange={(v) => update("address", v)} placeholder="Street / building (optional)" />
            </div>
            <TextField label="Latitude" value={form.lat} onChange={(v) => update("lat", v)} placeholder="25.2048 (optional)" />
            <TextField label="Longitude" value={form.lng} onChange={(v) => update("lng", v)} placeholder="55.2708 (optional)" />
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Capacity & Pricing</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Max Guests" value={form.maxGuests} onChange={(v) => update("maxGuests", v)} type="number" />
            <TextField label="Bedrooms" value={form.bedrooms} onChange={(v) => update("bedrooms", v)} type="number" />
            <TextField label="Bathrooms" value={form.bathrooms} onChange={(v) => update("bathrooms", v)} type="number" />
            <TextField label="Base Price" value={form.basePrice} onChange={(v) => update("basePrice", v)} type="number" />
            <TextField label="Cleaning Fee" value={form.cleaningFee} onChange={(v) => update("cleaningFee", v)} type="number" />
            <TextField label="Currency" value={form.currency} onChange={(v) => update("currency", v)} placeholder="PKR / AED / USD" />
            <TextField label="Min Nights" value={form.minNights} onChange={(v) => update("minNights", v)} type="number" />
            <TextField label="Max Nights" value={form.maxNights} onChange={(v) => update("maxNights", v)} type="number" placeholder="(optional)" />
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Ownership</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Vendor ID (optional)" value={form.vendorId} onChange={(v) => update("vendorId", v)} placeholder="Paste vendorId if assigning" />
            <div className="sm:col-span-2">
              <CheckboxField
                label="Publish immediately"
                checked={form.publishNow}
                onChange={(v) => update("publishNow", v)}
                help="Only enable if you are ready. You can also publish later from the list."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={props.onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#16A6C8] px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Create property
          </button>
        </div>
      </div>
    </DrawerShell>
  );
}

function PropertyDetailDrawer(props: {
  open: boolean;
  row: AdminPropertyRow;
  onClose: () => void;
  onRowPatched: (patch: Record<string, unknown>) => void;
}) {
  const id = safeId(props.row) ?? "";
  const [tab, setTab] = useState<"DETAILS" | "MEDIA">("DETAILS");

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<AdminPropertyDetail | null>(null);

  useEffect(() => {
    if (!props.open) return;
    setTab("DETAILS");
  }, [props.open]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setError(null);
      setBusy("Loading property...");
      setDetail(null);

      try {
        const d = await getAdminPropertyDetail(id);
        if (!alive) return;
        setDetail(d);
      } catch (e) {
        if (!alive) return;
        setDetail(null);
        setError(e instanceof Error ? e.message : "Failed to load property detail");
      } finally {
        if (!alive) return;
        setBusy(null);
      }
    }

    if (props.open && id) void run();
    return () => {
      alive = false;
    };
  }, [props.open, id]);

  const merged: Record<string, unknown> = useMemo(() => {
    const base = (asRecord(props.row) ?? {}) as Record<string, unknown>;
    const extra = (detail ?? {}) as Record<string, unknown>;
    return { ...base, ...extra };
  }, [props.row, detail]);

  const title = safeTitle(merged);
  const status = safeStatus(merged);
  const city = safeCity(merged);
  const area = safeArea(merged);
  const vendor = safeVendor(merged);
  const updatedAt = safeUpdatedAt(merged);
  const hero = primaryImageUrl(merged);

  const mediaFromMerged: AdminMediaItem[] = useMemo(() => {
    const rec = asRecord(merged);
    const raw = rec?.media;
    if (!Array.isArray(raw)) return [];
    const rows: AdminMediaItem[] = [];
    for (const it of raw) {
      const r = asRecord(it);
      if (!r) continue;
      const mid = typeof r.id === "string" ? r.id : null;
      const url = typeof r.url === "string" ? r.url : null;
      const sortOrder = typeof r.sortOrder === "number" && Number.isFinite(r.sortOrder) ? r.sortOrder : null;
      const cat = typeof r.category === "string" ? r.category : null;
      if (!mid || !url || sortOrder === null || !cat || !isMediaCategory(cat)) continue;
      rows.push({
        id: mid,
        url,
        sortOrder,
        category: cat,
        alt: typeof r.alt === "string" ? r.alt : null,
      });
    }
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [merged]);

  const [media, setMedia] = useState<AdminMediaItem[]>([]);
  useEffect(() => {
    setMedia(mediaFromMerged);
  }, [mediaFromMerged]);

  async function togglePublish() {
    if (!id) return;
    setError(null);
    setBusy(isPublished(status) ? "Unpublishing..." : "Publishing...");
    try {
      const next = isPublished(status) ? await unpublishAdminProperty(id) : await publishAdminProperty(id);
      setDetail(next);
      props.onRowPatched(next as unknown as Record<string, unknown>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  const subtitle = `${city}${area ? ` • ${area}` : ""} • ${sourceLabel(merged)} listing`;

  return (
    <DrawerShell open={props.open} title={title} subtitle={subtitle} onClose={props.onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={toneForPropertyStatus(status)}>{status}</StatusPill>
            <div className="rounded-full bg-[#f6f3ec] px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-black/5">
              Vendor: {vendor}
            </div>
            <div className="rounded-full bg-[#f6f3ec] px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-black/5">
              Updated: {fmtDate(updatedAt)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={tab} onChange={setTab} />
            <button
              type="button"
              onClick={() => void togglePublish()}
              disabled={busy !== null}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white shadow-sm",
                isPublished(status) ? "bg-slate-900 hover:bg-slate-800" : "bg-[#16A6C8] hover:opacity-95",
                busy ? "opacity-70" : ""
              )}
            >
              {isPublished(status) ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {busy ? <div className="rounded-2xl border border-black/10 bg-[#f6f3ec] p-3 text-sm text-slate-700">{busy}</div> : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 whitespace-pre-wrap">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-black/5 bg-[#f6f3ec]">
          <div className="relative h-56 w-full">
            {hero ? (
              <Image src={hero} alt={title} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Images className="h-4 w-4" />
                  No photos available
                </div>
              </div>
            )}
          </div>
        </div>

        {tab === "DETAILS" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <User className="h-4 w-4" />
                Listing source
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{sourceLabel(merged)}</div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <BadgeDollarSign className="h-4 w-4" />
                From
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {fmtMoney(getNumber(merged, "priceFrom") ?? getNumber(merged, "basePrice") ?? null, getString(merged, "currency"))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Created
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{fmtDate(getString(merged, "createdAt"))}</div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Updated
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{fmtDate(getString(merged, "updatedAt"))}</div>
            </div>
          </div>
        ) : (
          <MediaManagerAdmin
            propertyId={id}
            media={media}
            onMediaChanged={(next) => {
              setMedia(next);
              props.onRowPatched({ media: next });
            }}
          />
        )}
      </div>
    </DrawerShell>
  );
}

export default function AdminPropertiesPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);

  const [filters, setFilters] = useState<FilterState>({
    q: "",
    status: "ALL",
    city: "ALL",
    sort: "UPDATED_DESC",
  });

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<AdminPropertyRow | null>(null);

  async function reload(targetPage?: number) {
    const p = targetPage ?? page;
    setState({ kind: "loading" });
    try {
      const data = await getAdminProperties({ page: p, pageSize });
      setState({ kind: "ready", data });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Failed to load" });
    }
  }

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getAdminProperties({ page, pageSize });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Failed to load" });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, [page, pageSize]);

  const nav = useMemo(
    () => [
      { href: "/admin", label: "Overview" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/review-queue", label: "Review Queue" },
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/properties", label: "Properties" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/refunds", label: "Refunds" },
      { href: "/admin/ops-tasks", label: "Ops Tasks" },
    ],
    []
  );

  const derived = useMemo(() => {
    if (state.kind !== "ready") return null;

    const items = (state.data.items ?? []) as AdminPropertyRow[];

    const statuses = Array.from(new Set(items.map((r) => safeStatus(r)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    const cities = Array.from(new Set(items.map((r) => safeCity(r)).filter(Boolean))).sort((a, b) => a.localeCompare(b));

    const q = filters.q.trim().toLowerCase();
    let filtered = items
      .filter((r) => (filters.status === "ALL" ? true : safeStatus(r) === filters.status))
      .filter((r) => (filters.city === "ALL" ? true : safeCity(r) === filters.city))
      .filter((r) => {
        if (!q) return true;
        return JSON.stringify(asRecord(r) ?? {}).toLowerCase().includes(q);
      });

    filtered = filtered.sort((a, b) => {
      const au = safeUpdatedAt(a) ?? "";
      const bu = safeUpdatedAt(b) ?? "";
      const at = new Date(au).getTime();
      const bt = new Date(bu).getTime();
      const aN = Number.isFinite(at) ? at : 0;
      const bN = Number.isFinite(bt) ? bt : 0;
      return filters.sort === "UPDATED_DESC" ? bN - aN : aN - bN;
    });

    const total =
      typeof (state.data as unknown as { total?: number }).total === "number"
        ? (state.data as unknown as { total: number }).total
        : filtered.length;

    const totalPages =
      typeof (state.data as unknown as { totalPages?: number }).totalPages === "number"
        ? (state.data as unknown as { totalPages: number }).totalPages
        : Math.max(1, Math.ceil(total / pageSize));

    return { items, filtered, statuses, cities, totalPages, total };
  }, [state, filters, pageSize]);

  const columns: Array<Column<AdminPropertyRow>> = useMemo(() => {
    return [
      {
        key: "listing",
        header: "Listing",
        className: "col-span-5",
        render: (row) => {
          const title = safeTitle(row);
          const city = safeCity(row);
          const area = safeArea(row);
          const img = primaryImageUrl(row);
          const status = safeStatus(row);

          return (
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-16 overflow-hidden rounded-2xl border border-black/5 bg-[#f6f3ec]">
                {img ? <Image src={img} alt={title} fill className="object-cover" sizes="80px" /> : null}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {city}
                    {area ? ` • ${area}` : ""}
                  </span>
                  <StatusPill tone={toneForPropertyStatus(status)} className="ml-1">
                    {status}
                  </StatusPill>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "source",
        header: "Source",
        className: "col-span-1",
        render: (row) => {
          const src = sourceLabel(row);
          return (
            <div className="inline-flex">
              <StatusPill tone={src === "Admin" ? "success" : "neutral"}>{src}</StatusPill>
            </div>
          );
        },
      },
      {
        key: "vendor",
        header: "Vendor",
        className: "col-span-2",
        render: (row) => (
          <div className="flex items-center gap-2 text-slate-800">
            <User className="h-4 w-4 text-slate-400" />
            <span className="truncate">{safeVendor(row)}</span>
          </div>
        ),
      },
      {
        key: "updated",
        header: "Updated",
        className: "col-span-2",
        render: (row) => (
          <div className="flex items-center gap-2 text-slate-700">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>{fmtDate(safeUpdatedAt(row))}</span>
          </div>
        ),
      },
    ];
  }, []);

  async function quickPublishToggle(row: AdminPropertyRow) {
    const id = safeId(row);
    if (!id) return;

    const status = safeStatus(row);
    try {
      const next = isPublished(status) ? await unpublishAdminProperty(id) : await publishAdminProperty(id);

      setState((prev) => {
        if (prev.kind !== "ready") return prev;
        const items = prev.data.items.map((r) => {
          const rid = safeId(r);
          if (rid !== id) return r;
          return { ...(asRecord(r) ?? {}), ...(next as unknown as Record<string, unknown>) };
        });
        return { kind: "ready", data: { ...prev.data, items } };
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Action failed";
      // eslint-disable-next-line no-alert
      alert(msg);
    }
  }

  return (
    <PortalShell role="admin" title="Properties" subtitle="Admin-created listings, vendor listings, media quality, and publish control." nav={nav}>
      <div className="space-y-6">
        {/* ✅ Always-visible page header actions (NOT dependent on Toolbar implementation) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-slate-900">Admin Properties</div>
            <div className="mt-1 text-sm text-slate-600">Create, review, manage media quality, and publish/unpublish listings.</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/properties/new"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              New property
            </Link>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Quick add
            </button>
          </div>
        </div>

        {/* Filters / search */}
        <Toolbar
          title="Filters"
          subtitle="Search and filter listings. Click a row to open details (including media manager)."
          searchPlaceholder="Search title, city, vendor, id…"
          onSearch={(v) => setFilters((p) => ({ ...p, q: v }))}
          right={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.city}
                onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
              >
                <option value="ALL">All cities</option>
                {(derived?.cities ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
              >
                <option value="ALL">All statuses</option>
                {(derived?.statuses ?? []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={filters.sort}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((p) => ({ ...p, sort: v === "UPDATED_ASC" ? "UPDATED_ASC" : "UPDATED_DESC" }));
                }}
                className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
              >
                <option value="UPDATED_DESC">Updated (newest)</option>
                <option value="UPDATED_ASC">Updated (oldest)</option>
              </select>
            </div>
          }
        />

        {state.kind === "loading" ? (
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-[86px]" />
            ))}
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">{state.message}</div>
        ) : !derived || derived.filtered.length === 0 ? (
          <EmptyState title="No properties found" description="Try changing status / city filters or clearing the search." icon={<Building2 className="h-6 w-6" />} />
        ) : (
          <>
            <div className="text-xs text-slate-600">
              Showing <span className="font-semibold text-slate-900">{Math.min(derived.filtered.length, pageSize)}</span> rows (page {page}). Total{" "}
              <span className="font-semibold text-slate-900">{derived.total}</span>.
            </div>

            <DataTable<AdminPropertyRow>
              title="Properties"
              subtitle={<span>Click any row to open the right-side drawer.</span>}
              columns={columns}
              rows={derived.filtered}
              count={derived.total}
              headerRight={null}
              onRowClick={(row) => setSelected(row)}
              rowActions={(row) => {
                const status = safeStatus(row);
                const id = safeId(row);

                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                      Details
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                      Media
                    </button>

                    <button
                      type="button"
                      disabled={!id}
                      onClick={() => void quickPublishToggle(row)}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-white shadow-sm",
                        isPublished(status) ? "bg-slate-900 hover:bg-slate-800" : "bg-[#16A6C8] hover:opacity-95"
                      )}
                    >
                      {isPublished(status) ? "Unpublish" : "Publish"}
                    </button>
                  </>
                );
              }}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Prev
              </button>

              <div className="text-sm text-slate-600">
                Page <span className="font-semibold text-slate-900">{page}</span> /{" "}
                <span className="font-semibold text-slate-900">{derived.totalPages}</span>
              </div>

              <button
                type="button"
                disabled={page >= derived.totalPages}
                onClick={() => setPage((p) => Math.min(derived.totalPages, p + 1))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        <CreatePropertyDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setSelected(null);
            setPage(1);
            void reload(1);
          }}
        />

        {selected ? (
          <PropertyDetailDrawer
            open={true}
            row={selected}
            onClose={() => setSelected(null)}
            onRowPatched={(patch) => {
              const id = safeId(selected);
              if (!id) return;

              setSelected((prev) => {
                if (!prev) return prev;
                const rid = safeId(prev);
                if (rid !== id) return prev;
                return { ...(asRecord(prev) ?? {}), ...(patch as Record<string, unknown>) } as AdminPropertyRow;
              });

              setState((prev) => {
                if (prev.kind !== "ready") return prev;
                const items = prev.data.items.map((r) => {
                  const rid = safeId(r);
                  if (rid !== id) return r;
                  return { ...(asRecord(r) ?? {}), ...(patch as Record<string, unknown>) };
                });
                return { kind: "ready", data: { ...prev.data, items } };
              });
            }}
          />
        ) : null}
      </div>
    </PortalShell>
  );
}
