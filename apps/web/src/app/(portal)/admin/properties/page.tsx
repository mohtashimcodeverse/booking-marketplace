"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  User,
  CalendarDays,
  BadgeDollarSign,
  Images,
  Plus,
  X,
} from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { EmptyState } from "@/components/portal/ui/EmptyState";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { DataTable, type Column } from "@/components/portal/ui/DataTable";
import { AdminPropertyMediaManager } from "@/components/portal/admin/properties/AdminPropertyMediaManager";

import {
  createAdminProperty,
  deleteAdminOwnedProperty,
  getAdminAmenitiesCatalog,
  getAdminProperties,
  getAdminPropertyDetail,
  getAdminVendors,
  publishAdminProperty,
  unpublishAdminProperty,
  updateAdminProperty,
  updateAdminPropertyAmenities,
  type AdminPropertyCreateInput,
  type AdminPropertyDetail,
  type AdminMediaItem,
  type MediaCategory,
} from "@/lib/api/portal/admin";
import {
  approveAdminProperty,
  rejectAdminProperty,
  requestChangesAdminProperty,
} from "@/lib/api/admin/reviewQueue";
import { apiUrl } from "@/lib/api/base";

type AdminPropertiesResponse = Awaited<ReturnType<typeof getAdminProperties>>;
type AdminPropertyRow = AdminPropertiesResponse["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminPropertiesResponse };
type AdminVendorOption = { id: string; label: string };

type FilterState = {
  q: string;
  status: string;
  city: string;
  sort: "UPDATED_DESC" | "UPDATED_ASC";
};

type PropertyDrawerTab =
  | "REVIEW"
  | "BASICS"
  | "LOCATION"
  | "AMENITIES"
  | "PHOTOS"
  | "DOCUMENTS"
  | "PUBLISH";

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
      <button type="button" className="absolute inset-0 bg-dark-1/40" onClick={props.onClose} aria-label="Close drawer" />
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-surface shadow-2xl">
        <div className="border-b border-line/50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-primary truncate">{props.title}</div>
              {props.subtitle ? <div className="mt-1 text-sm text-secondary">{props.subtitle}</div> : null}
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-line/80 bg-surface hover:bg-warm-alt"
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

function Tabs(props: {
  value: PropertyDrawerTab;
  onChange: (v: PropertyDrawerTab) => void;
}) {
  const items: Array<{ key: PropertyDrawerTab; label: string }> = [
    { key: "REVIEW", label: "Review" },
    { key: "BASICS", label: "Basics" },
    { key: "LOCATION", label: "Location" },
    { key: "AMENITIES", label: "Amenities" },
    { key: "PHOTOS", label: "Photos" },
    { key: "DOCUMENTS", label: "Documents" },
    { key: "PUBLISH", label: "Publish" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line/80 bg-surface p-1">
      {items.map((it) => {
        const active = props.value === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => props.onChange(it.key)}
            className={cn(
              "h-10 rounded-2xl px-4 text-sm font-semibold",
              active ? "bg-brand text-accent-text" : "text-primary hover:bg-warm-alt"
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
      <div className="text-xs font-semibold text-secondary">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        type={props.type ?? "text"}
        className="mt-1 h-11 w-full rounded-2xl border border-line/80 bg-surface px-4 text-sm text-primary shadow-sm outline-none placeholder:text-muted focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
      />
      {props.help ? <div className="mt-1 text-xs text-muted">{props.help}</div> : null}
    </label>
  );
}

function CheckboxField(props: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-line/80 bg-surface p-4">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-brand"
      />
      <div>
        <div className="text-sm font-semibold text-primary">{props.label}</div>
        {props.help ? <div className="mt-1 text-xs text-secondary">{props.help}</div> : null}
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

function CreatePropertyDrawer(props: { open: boolean; onClose: () => void; onCreated: (row: AdminPropertyDetail) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorOptions, setVendorOptions] = useState<AdminVendorOption[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState<string | null>(null);

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
    currency: "AED",
    minNights: "1",
    maxNights: "",
    vendorId: "",
    publishNow: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  useEffect(() => {
    let alive = true;
    async function loadVendors() {
      setVendorsLoading(true);
      setVendorsError(null);
      try {
        const data = await getAdminVendors({ page: 1, pageSize: 200 });
        if (!alive) return;
        const rows = Array.isArray(data.items) ? data.items : [];
        const normalized = rows
          .map((item) => {
            const row = item as Record<string, unknown>;
            const id = typeof row.id === "string" ? row.id : "";
            if (!id) return null;
            const fullName = typeof row.fullName === "string" ? row.fullName : "";
            const email = typeof row.email === "string" ? row.email : "";
            const display = fullName || email || id;
            return { id, label: email ? `${display} (${email})` : display };
          })
          .filter((option): option is AdminVendorOption => option !== null)
          .sort((a, b) => a.label.localeCompare(b.label));
        setVendorOptions(normalized);
      } catch (loadError) {
        if (!alive) return;
        setVendorsError(loadError instanceof Error ? loadError.message : "Failed to load vendors");
      } finally {
        if (!alive) return;
        setVendorsLoading(false);
      }
    }

    void loadVendors();
    return () => {
      alive = false;
    };
  }, []);

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
        {busy ? <div className="rounded-2xl border border-line/80 bg-warm-base p-3 text-sm text-secondary">{busy}</div> : null}
        {error ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/12 p-3 text-sm text-danger whitespace-pre-wrap">{error}</div>
        ) : null}

        <div className="rounded-3xl border border-line/50 bg-surface p-5 shadow-sm">
          <div className="text-sm font-semibold text-primary">Basics</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Title" value={form.title} onChange={(v) => update("title", v)} placeholder="e.g., Marina View Apartment" />
            <TextField label="Slug" value={form.slug} onChange={(v) => update("slug", v)} placeholder="e.g., marina-view-apartment" help="Must be unique." />
            <div className="sm:col-span-2">
              <TextField label="Description" value={form.description} onChange={(v) => update("description", v)} placeholder="Short description (optional)" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-line/50 bg-surface p-5 shadow-sm">
          <div className="text-sm font-semibold text-primary">Location</div>
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

        <div className="rounded-3xl border border-line/50 bg-surface p-5 shadow-sm">
          <div className="text-sm font-semibold text-primary">Capacity & Pricing</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Max Guests" value={form.maxGuests} onChange={(v) => update("maxGuests", v)} type="number" />
            <TextField label="Bedrooms" value={form.bedrooms} onChange={(v) => update("bedrooms", v)} type="number" />
            <TextField label="Bathrooms" value={form.bathrooms} onChange={(v) => update("bathrooms", v)} type="number" />
            <TextField label="Base Price" value={form.basePrice} onChange={(v) => update("basePrice", v)} type="number" />
            <TextField label="Cleaning Fee" value={form.cleaningFee} onChange={(v) => update("cleaningFee", v)} type="number" />
            <TextField label="Currency" value={form.currency} onChange={(v) => update("currency", v)} placeholder="AED / USD / EUR / GBP" />
            <TextField label="Min Nights" value={form.minNights} onChange={(v) => update("minNights", v)} type="number" />
            <TextField label="Max Nights" value={form.maxNights} onChange={(v) => update("maxNights", v)} type="number" placeholder="(optional)" />
          </div>
        </div>

        <div className="rounded-3xl border border-line/50 bg-surface p-5 shadow-sm">
          <div className="text-sm font-semibold text-primary">Ownership</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block">
                <div className="mb-1 text-xs font-semibold text-secondary">Vendor owner (optional)</div>
                {vendorsLoading ? (
                  <div className="h-11 w-full animate-pulse rounded-2xl border border-line/80 bg-warm-alt" />
                ) : vendorsError ? (
                  <div className="rounded-2xl border border-danger/30 bg-danger/12 px-4 py-3 text-xs text-danger">
                    {vendorsError}
                  </div>
                ) : (
                  <select
                    value={form.vendorId}
                    onChange={(event) => update("vendorId", event.target.value)}
                    className="h-11 w-full rounded-2xl border border-line/80 bg-surface px-3 text-sm text-primary shadow-sm outline-none focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
                  >
                    <option value="">Admin-owned listing (default)</option>
                    {vendorOptions.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.label}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            </div>
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
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-line/80 bg-surface px-4 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-accent-text shadow-sm hover:opacity-95"
          >
            Create property
          </button>
        </div>
      </div>
    </DrawerShell>
  );
}

export function PropertyDetailDrawer(props: {
  open: boolean;
  row: AdminPropertyRow;
  onClose: () => void;
  onRowPatched: (patch: Record<string, unknown>) => void;
}) {
  const id = safeId(props.row) ?? "";
  const [tab, setTab] = useState<PropertyDrawerTab>("REVIEW");

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<AdminPropertyDetail | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [amenityCatalog, setAmenityCatalog] = useState<
    Awaited<ReturnType<typeof getAdminAmenitiesCatalog>>["amenitiesGrouped"]
  >([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [amenitiesError, setAmenitiesError] = useState<string | null>(null);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

  const [basicsForm, setBasicsForm] = useState({
    title: "",
    slug: "",
    description: "",
    maxGuests: "2",
    bedrooms: "1",
    bathrooms: "1",
    basePrice: "25000",
    cleaningFee: "0",
    currency: "AED",
    minNights: "1",
    maxNights: "",
  });

  const [locationForm, setLocationForm] = useState({
    city: "Dubai",
    area: "",
    address: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!props.open) return;
    setTab("REVIEW");
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

  const documents = useMemo(() => {
    const raw = asRecord(merged)?.documents;
    if (!Array.isArray(raw)) return [] as Array<{
      id: string;
      type: string;
      createdAt: string | null;
      originalName: string | null;
      mimeType: string | null;
      url: string | null;
    }>;

    const items = raw
      .map((item) => {
        const row = asRecord(item);
        if (!row) return null;
        const docId = typeof row.id === "string" ? row.id : null;
        const type = typeof row.type === "string" ? row.type : "OTHER";
        if (!docId) return null;
        return {
          id: docId,
          type,
          createdAt: typeof row.createdAt === "string" ? row.createdAt : null,
          originalName: typeof row.originalName === "string" ? row.originalName : null,
          mimeType: typeof row.mimeType === "string" ? row.mimeType : null,
          url: typeof row.url === "string" ? row.url : null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return items;
  }, [merged]);

  const amenityRows = useMemo(() => {
    const raw = asRecord(merged)?.amenities;
    if (!Array.isArray(raw)) return [] as Array<{ id: string; name: string; group: string }>;
    const parsed = raw
      .map((item) => {
        const row = asRecord(item);
        const amenity = asRecord(row?.amenity);
        const idValue = typeof amenity?.id === "string" ? amenity.id : null;
        if (!idValue) return null;
        const name = typeof amenity?.name === "string" ? amenity.name : "Unnamed";
        const groupName =
          typeof asRecord(amenity?.group)?.name === "string"
            ? String(asRecord(amenity?.group)?.name)
            : "Other";
        return { id: idValue, name, group: groupName };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
    return parsed;
  }, [merged]);

  useEffect(() => {
    setSelectedAmenityIds(amenityRows.map((item) => item.id));
  }, [amenityRows]);

  useEffect(() => {
    setBasicsForm({
      title: getString(merged, "title") ?? "",
      slug: getString(merged, "slug") ?? "",
      description: getString(merged, "description") ?? "",
      maxGuests: String(getNumber(merged, "maxGuests") ?? 2),
      bedrooms: String(getNumber(merged, "bedrooms") ?? 1),
      bathrooms: String(getNumber(merged, "bathrooms") ?? 1),
      basePrice: String(getNumber(merged, "basePrice") ?? 25000),
      cleaningFee: String(getNumber(merged, "cleaningFee") ?? 0),
      currency: getString(merged, "currency") ?? "AED",
      minNights: String(getNumber(merged, "minNights") ?? 1),
      maxNights: getNumber(merged, "maxNights") === null ? "" : String(getNumber(merged, "maxNights")),
    });

    setLocationForm({
      city: getString(merged, "city") ?? "Dubai",
      area: getString(merged, "area") ?? "",
      address: getString(merged, "address") ?? "",
      lat: getNumber(merged, "lat") === null ? "" : String(getNumber(merged, "lat")),
      lng: getNumber(merged, "lng") === null ? "" : String(getNumber(merged, "lng")),
    });
  }, [merged]);

  const checklist = useMemo(() => {
    const requiredCategories = new Set(["LIVING_ROOM", "BEDROOM", "BATHROOM", "KITCHEN"]);
    const mediaCategories = new Set(media.map((item) => item.category));
    const hasRequiredCategories = Array.from(requiredCategories).every((category) => mediaCategories.has(category as MediaCategory));
    const hasOwnershipDoc = documents.some((doc) => doc.type === "OWNERSHIP_PROOF");
    const hasBasics =
      (getString(merged, "title") ?? "").trim().length > 0 &&
      (getString(merged, "city") ?? "").trim().length > 0 &&
      (getNumber(merged, "basePrice") ?? 0) > 0;
    const hasAmenities = amenityRows.length > 0;

    const gates = [
      { label: "Basics completed", ok: hasBasics },
      { label: "At least 4 listing photos", ok: media.length >= 4 },
      { label: "Required photo categories", ok: hasRequiredCategories },
      { label: "Ownership proof uploaded", ok: hasOwnershipDoc },
      { label: "Amenities selected", ok: hasAmenities },
    ];
    return {
      gates,
      ready: gates.every((gate) => gate.ok),
    };
  }, [amenityRows.length, documents, media, merged]);

  async function reloadDetail() {
    if (!id) return;
    const next = await getAdminPropertyDetail(id);
    setDetail(next);
    props.onRowPatched(next as unknown as Record<string, unknown>);
  }

  async function ensureAmenitiesCatalog() {
    if (amenityCatalog.length > 0 || amenitiesLoading) return;
    setAmenitiesLoading(true);
    setAmenitiesError(null);
    try {
      const catalog = await getAdminAmenitiesCatalog();
      setAmenityCatalog(catalog.amenitiesGrouped ?? []);
    } catch (catalogError) {
      setAmenitiesError(catalogError instanceof Error ? catalogError.message : "Failed to load amenities");
    } finally {
      setAmenitiesLoading(false);
    }
  }

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

  async function moderate(action: "approve" | "requestChanges" | "reject") {
    if (!id) return;
    setError(null);
    setBusy(
      action === "approve"
        ? "Approving listing..."
        : action === "requestChanges"
          ? "Requesting changes..."
          : "Rejecting listing...",
    );
    try {
      const note = moderationNote.trim() || undefined;
      if (action === "approve") {
        await approveAdminProperty(id);
      } else if (action === "requestChanges") {
        await requestChangesAdminProperty(id, note);
      } else {
        await rejectAdminProperty(id, note);
      }
      setModerationNote("");
      await reloadDetail();
    } catch (moderationError) {
      setError(moderationError instanceof Error ? moderationError.message : "Moderation action failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveBasics() {
    if (!id) return;
    const maxGuests = toInt(basicsForm.maxGuests);
    const bedrooms = toInt(basicsForm.bedrooms);
    const bathrooms = toInt(basicsForm.bathrooms);
    const basePrice = toFloat(basicsForm.basePrice);
    const cleaningFee = toFloat(basicsForm.cleaningFee);
    const minNights = toInt(basicsForm.minNights);
    const maxNights = toInt(basicsForm.maxNights);

    if (!basicsForm.title.trim()) return setError("Title is required.");
    if (!basicsForm.slug.trim()) return setError("Slug is required.");
    if (maxGuests === null || maxGuests <= 0) return setError("Max guests must be a positive number.");
    if (bedrooms === null || bedrooms < 0) return setError("Bedrooms must be a valid number.");
    if (bathrooms === null || bathrooms < 0) return setError("Bathrooms must be a valid number.");
    if (basePrice === null || basePrice <= 0) return setError("Base price must be a positive number.");

    setError(null);
    setBusy("Saving basics...");
    try {
      const next = await updateAdminProperty(id, {
        title: basicsForm.title.trim(),
        slug: basicsForm.slug.trim(),
        description: basicsForm.description.trim() || null,
        maxGuests,
        bedrooms,
        bathrooms,
        basePrice,
        cleaningFee: cleaningFee ?? 0,
        currency: basicsForm.currency.trim() || "AED",
        minNights: minNights ?? 1,
        maxNights: maxNights ?? null,
      });
      setDetail(next);
      props.onRowPatched(next as unknown as Record<string, unknown>);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save basics");
    } finally {
      setBusy(null);
    }
  }

  async function saveLocation() {
    if (!id) return;
    const lat = toFloat(locationForm.lat);
    const lng = toFloat(locationForm.lng);
    if (!locationForm.city.trim()) return setError("City is required.");

    setError(null);
    setBusy("Saving location...");
    try {
      const next = await updateAdminProperty(id, {
        city: locationForm.city.trim(),
        area: locationForm.area.trim() || null,
        address: locationForm.address.trim() || null,
        lat: lat ?? null,
        lng: lng ?? null,
      });
      setDetail(next);
      props.onRowPatched(next as unknown as Record<string, unknown>);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save location");
    } finally {
      setBusy(null);
    }
  }

  async function saveAmenities() {
    if (!id) return;
    setError(null);
    setBusy("Saving amenities...");
    try {
      const next = await updateAdminPropertyAmenities(id, selectedAmenityIds);
      setDetail(next);
      props.onRowPatched(next as unknown as Record<string, unknown>);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save amenities");
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
            <div className="rounded-full bg-warm-base px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-line/55">
              Vendor: {vendor}
            </div>
            <div className="rounded-full bg-warm-base px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-line/55">
              Updated: {fmtDate(updatedAt)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={tab}
              onChange={(next) => {
                if (next === "AMENITIES") void ensureAmenitiesCatalog();
                setTab(next);
              }}
            />
            <button
              type="button"
              onClick={() => void togglePublish()}
              disabled={busy !== null}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-inverted shadow-sm",
                isPublished(status) ? "bg-brand hover:bg-brand-hover" : "bg-brand hover:opacity-95",
                busy ? "opacity-70" : ""
              )}
            >
              {isPublished(status) ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {busy ? <div className="rounded-2xl border border-line/80 bg-warm-base p-3 text-sm text-secondary">{busy}</div> : null}
        {error ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/12 p-3 text-sm text-danger whitespace-pre-wrap">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-line/50 bg-warm-base">
          <div className="relative h-56 w-full">
            {hero ? (
              <Image src={hero} alt={title} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-secondary">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Images className="h-4 w-4" />
                  No photos available
                </div>
              </div>
            )}
          </div>
        </div>

        {tab === "REVIEW" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {checklist.gates.map((gate) => (
                <div key={gate.label} className="rounded-2xl border border-line/50 bg-surface p-4 shadow-sm">
                  <div className="text-xs font-semibold text-muted">Readiness</div>
                  <div className="mt-1 text-sm font-semibold text-primary">{gate.label}</div>
                  <div className={cn("mt-2 text-xs font-semibold", gate.ok ? "text-success" : "text-warning")}>
                    {gate.ok ? "Passed" : "Pending"}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
              <div className="text-sm font-semibold text-primary">Admin moderation</div>
              <div className="mt-1 text-xs text-secondary">
                Use backend review actions directly from this editor.
              </div>
              <textarea
                value={moderationNote}
                onChange={(event) => setModerationNote(event.target.value)}
                rows={3}
                placeholder="Optional moderation note..."
                className="mt-3 w-full rounded-2xl border border-line/80 bg-surface px-4 py-3 text-sm text-primary outline-none focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void moderate("approve")}
                  disabled={busy !== null}
                  className="inline-flex h-10 items-center rounded-xl bg-success px-4 text-xs font-semibold text-inverted hover:bg-success disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void moderate("requestChanges")}
                  disabled={busy !== null}
                  className="inline-flex h-10 items-center rounded-xl bg-warning px-4 text-xs font-semibold text-inverted hover:bg-warning disabled:opacity-60"
                >
                  Request changes
                </button>
                <button
                  type="button"
                  onClick={() => void moderate("reject")}
                  disabled={busy !== null}
                  className="inline-flex h-10 items-center rounded-xl bg-danger px-4 text-xs font-semibold text-inverted hover:bg-danger disabled:opacity-60"
                >
                  Reject
                </button>
                <div className={cn("inline-flex h-10 items-center rounded-xl px-4 text-xs font-semibold", checklist.ready ? "bg-success/12 text-success" : "bg-warning/12 text-warning")}>
                  {checklist.ready ? "Listing readiness: complete" : "Listing readiness: incomplete"}
                </div>
              </div>
            </div>
          </div>
        ) : tab === "BASICS" ? (
          <div className="rounded-3xl border border-line/50 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Basics</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField label="Title" value={basicsForm.title} onChange={(v) => setBasicsForm((p) => ({ ...p, title: v }))} />
              <TextField label="Slug" value={basicsForm.slug} onChange={(v) => setBasicsForm((p) => ({ ...p, slug: v }))} />
              <div className="sm:col-span-2">
                <TextField
                  label="Description"
                  value={basicsForm.description}
                  onChange={(v) => setBasicsForm((p) => ({ ...p, description: v }))}
                />
              </div>
              <TextField label="Max guests" type="number" value={basicsForm.maxGuests} onChange={(v) => setBasicsForm((p) => ({ ...p, maxGuests: v }))} />
              <TextField label="Bedrooms" type="number" value={basicsForm.bedrooms} onChange={(v) => setBasicsForm((p) => ({ ...p, bedrooms: v }))} />
              <TextField label="Bathrooms" type="number" value={basicsForm.bathrooms} onChange={(v) => setBasicsForm((p) => ({ ...p, bathrooms: v }))} />
              <TextField label="Base price" type="number" value={basicsForm.basePrice} onChange={(v) => setBasicsForm((p) => ({ ...p, basePrice: v }))} />
              <TextField label="Cleaning fee" type="number" value={basicsForm.cleaningFee} onChange={(v) => setBasicsForm((p) => ({ ...p, cleaningFee: v }))} />
              <TextField label="Currency" value={basicsForm.currency} onChange={(v) => setBasicsForm((p) => ({ ...p, currency: v }))} />
              <TextField label="Min nights" type="number" value={basicsForm.minNights} onChange={(v) => setBasicsForm((p) => ({ ...p, minNights: v }))} />
              <TextField label="Max nights" type="number" value={basicsForm.maxNights} onChange={(v) => setBasicsForm((p) => ({ ...p, maxNights: v }))} />
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => void saveBasics()}
                disabled={busy !== null}
                className="inline-flex h-11 items-center rounded-2xl bg-brand px-5 text-sm font-semibold text-accent-text shadow-sm hover:bg-brand-hover disabled:opacity-60"
              >
                Save basics
              </button>
            </div>
          </div>
        ) : tab === "LOCATION" ? (
          <div className="rounded-3xl border border-line/50 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Location</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField label="City" value={locationForm.city} onChange={(v) => setLocationForm((p) => ({ ...p, city: v }))} />
              <TextField label="Area" value={locationForm.area} onChange={(v) => setLocationForm((p) => ({ ...p, area: v }))} />
              <div className="sm:col-span-2">
                <TextField label="Address" value={locationForm.address} onChange={(v) => setLocationForm((p) => ({ ...p, address: v }))} />
              </div>
              <TextField label="Latitude" value={locationForm.lat} onChange={(v) => setLocationForm((p) => ({ ...p, lat: v }))} />
              <TextField label="Longitude" value={locationForm.lng} onChange={(v) => setLocationForm((p) => ({ ...p, lng: v }))} />
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => void saveLocation()}
                disabled={busy !== null}
                className="inline-flex h-11 items-center rounded-2xl bg-brand px-5 text-sm font-semibold text-accent-text shadow-sm hover:bg-brand-hover disabled:opacity-60"
              >
                Save location
              </button>
            </div>
          </div>
        ) : tab === "AMENITIES" ? (
          <div className="rounded-3xl border border-line/50 bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-primary">Amenities</div>
                <div className="mt-1 text-xs text-secondary">Same grouped catalog and selection model as vendor editor.</div>
              </div>
              <div className="text-xs font-semibold text-secondary">Selected: {selectedAmenityIds.length}</div>
            </div>

            <div className="mt-4 space-y-4">
              {amenitiesLoading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-20" />
                  ))}
                </div>
              ) : amenitiesError ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/12 p-4 text-sm text-danger">{amenitiesError}</div>
              ) : amenityCatalog.length === 0 ? (
                <EmptyState title="No amenities catalog" description="Catalog is empty or unavailable." icon={<Building2 className="h-6 w-6" />} />
              ) : (
                amenityCatalog.map((group) => (
                  <div key={group.group?.id ?? "ungrouped"} className="rounded-2xl border border-line/80 p-4">
                    <div className="text-sm font-semibold text-primary">{group.group?.name ?? "Other"}</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {group.amenities.map((amenity) => {
                        const selected = selectedAmenityIds.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() =>
                              setSelectedAmenityIds((current) =>
                                current.includes(amenity.id)
                                  ? current.filter((idValue) => idValue !== amenity.id)
                                  : [...current, amenity.id],
                              )
                            }
                            className={cn(
                              "rounded-xl border px-3 py-2 text-left text-sm font-medium",
                              selected ? "border-brand/45 bg-accent-soft/80 text-primary" : "border-line/80 bg-surface text-secondary hover:bg-warm-alt",
                            )}
                          >
                            {amenity.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => void saveAmenities()}
                disabled={busy !== null}
                className="inline-flex h-11 items-center rounded-2xl bg-brand px-5 text-sm font-semibold text-accent-text shadow-sm hover:bg-brand-hover disabled:opacity-60"
              >
                Save amenities
              </button>
            </div>
          </div>
        ) : tab === "PHOTOS" ? (
          <AdminPropertyMediaManager
            propertyId={id}
            initialMedia={media}
            onChange={(next) => {
              setMedia(next);
              props.onRowPatched({ media: next });
            }}
          />
        ) : tab === "DOCUMENTS" ? (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <EmptyState title="No documents" description="Vendor has not uploaded private documents yet." icon={<User className="h-6 w-6" />} />
            ) : (
              documents.map((doc) => {
                const fallback = apiUrl(
                  `/admin/properties/${encodeURIComponent(id)}/documents/${encodeURIComponent(doc.id)}/download`
                );
                const href = doc.url?.trim().length ? doc.url : fallback;
                return (
                  <div key={doc.id} className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-primary">{doc.originalName ?? `${doc.type} document`}</div>
                        <div className="mt-1 text-xs text-secondary">
                          {doc.type} • {doc.mimeType ?? "application/pdf"} • Uploaded {fmtDate(doc.createdAt)}
                        </div>
                      </div>
                      <a
                        href={href}
                        className="inline-flex h-10 items-center rounded-xl border border-line/80 bg-surface px-4 text-xs font-semibold text-primary shadow-sm hover:bg-warm-alt"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : tab === "PUBLISH" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
              <div className="text-xs font-semibold text-muted">Current status</div>
              <div className="mt-1 text-sm font-semibold text-primary">{status}</div>
              <div className="mt-2 text-xs text-secondary">
                Backend is source of truth. Publish state changes are applied server-side only.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void togglePublish()}
                  disabled={busy !== null}
                  className={cn(
                    "inline-flex h-10 items-center rounded-xl px-4 text-xs font-semibold text-inverted",
                    isPublished(status) ? "bg-brand hover:bg-brand-hover" : "bg-brand hover:opacity-95",
                    busy ? "opacity-60" : "",
                  )}
                >
                  {isPublished(status) ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => void reloadDetail()}
                  disabled={busy !== null}
                  className="inline-flex h-10 items-center rounded-xl border border-line/80 bg-surface px-4 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
              <div className="text-xs font-semibold text-muted">Audit timeline</div>
              <div className="mt-2 text-sm text-secondary">Created: {fmtDate(getString(merged, "createdAt"))}</div>
              <div className="mt-1 text-sm text-secondary">Updated: {fmtDate(getString(merged, "updatedAt"))}</div>
              <div className="mt-1 text-sm text-secondary">Vendor: {vendor}</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <User className="h-4 w-4" />
                Listing source
              </div>
              <div className="mt-2 text-sm font-semibold text-primary">{sourceLabel(merged)}</div>
            </div>

            <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <BadgeDollarSign className="h-4 w-4" />
                From
              </div>
              <div className="mt-2 text-sm font-semibold text-primary">
                {fmtMoney(getNumber(merged, "priceFrom") ?? getNumber(merged, "basePrice") ?? null, getString(merged, "currency"))}
              </div>
            </div>

            <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <CalendarDays className="h-4 w-4" />
                Created
              </div>
              <div className="mt-2 text-sm font-semibold text-primary">{fmtDate(getString(merged, "createdAt"))}</div>
            </div>

            <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <CalendarDays className="h-4 w-4" />
                Updated
              </div>
              <div className="mt-2 text-sm font-semibold text-primary">{fmtDate(getString(merged, "updatedAt"))}</div>
            </div>
          </div>
        )}
      </div>
    </DrawerShell>
  );
}

export default function AdminPropertiesPage() {
  const router = useRouter();
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
              <div className="relative h-12 w-16 overflow-hidden rounded-2xl border border-line/50 bg-warm-base">
                {img ? <Image src={img} alt={title} fill className="object-cover" sizes="80px" /> : null}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-primary">{title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
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
          <div className="flex items-center gap-2 text-primary">
            <User className="h-4 w-4 text-muted" />
            <span className="truncate">{safeVendor(row)}</span>
          </div>
        ),
      },
      {
        key: "updated",
        header: "Updated",
        className: "col-span-2",
        render: (row) => (
          <div className="flex items-center gap-2 text-secondary">
            <CalendarDays className="h-4 w-4 text-muted" />
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
      alert(msg);
    }
  }

  async function quickDeleteAdminOwned(row: AdminPropertyRow) {
    const id = safeId(row);
    if (!id) return;
    if (sourceLabel(row) !== "Admin") return;

    const confirmed = window.confirm(
      "Delete this admin-owned property now? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deleteAdminOwnedProperty(id);
      await reload(page);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <PortalShell role="admin" title="Properties" subtitle="Admin-created listings, vendor listings, media quality, and publish control." nav={nav}>
      <div className="space-y-6">
        {/* ✅ Always-visible page header actions (NOT dependent on Toolbar implementation) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-primary">Admin Properties</div>
            <div className="mt-1 text-sm text-secondary">Create, review, manage media quality, and publish/unpublish listings.</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/properties/new"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line/80 bg-surface px-4 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
            >
              <Plus className="h-4 w-4" />
              New property
            </Link>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-brand px-4 text-sm font-semibold text-accent-text shadow-sm hover:opacity-95"
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
                className="h-11 rounded-2xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary shadow-sm outline-none focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
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
                className="h-11 rounded-2xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary shadow-sm outline-none focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
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
                className="h-11 rounded-2xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary shadow-sm outline-none focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
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
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">{state.message}</div>
        ) : !derived || derived.filtered.length === 0 ? (
          <EmptyState title="No properties found" description="Try changing status / city filters or clearing the search." icon={<Building2 className="h-6 w-6" />} />
        ) : (
          <>
            <div className="text-xs text-secondary">
              Showing <span className="font-semibold text-primary">{Math.min(derived.filtered.length, pageSize)}</span> rows (page {page}). Total{" "}
              <span className="font-semibold text-primary">{derived.total}</span>.
            </div>

            <DataTable<AdminPropertyRow>
              title="Properties"
              subtitle={<span>Click any row to open the full detail page.</span>}
              columns={columns}
              rows={derived.filtered}
              count={derived.total}
              headerRight={null}
              onRowClick={(row) => {
                const id = safeId(row);
                if (!id) return;
                router.push(`/admin/properties/${encodeURIComponent(id)}`);
              }}
              rowActions={(row) => {
                const status = safeStatus(row);
                const id = safeId(row);
                const adminOwned = sourceLabel(row) === "Admin";

                return (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (!id) return;
                        router.push(`/admin/properties/${encodeURIComponent(id)}`);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-line/80 bg-surface px-3 text-xs font-semibold text-primary shadow-sm hover:bg-warm-alt"
                    >
                      Details
                    </button>

                    {adminOwned ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!id) return;
                          router.push(`/admin/properties/${encodeURIComponent(id)}`);
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-line/80 bg-surface px-3 text-xs font-semibold text-primary shadow-sm hover:bg-warm-alt"
                      >
                        Media
                      </button>
                    ) : null}

                    <button
                      type="button"
                      disabled={!id}
                      onClick={() => void quickPublishToggle(row)}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-inverted shadow-sm",
                        isPublished(status) ? "bg-brand hover:bg-brand-hover" : "bg-brand hover:opacity-95"
                      )}
                    >
                      {isPublished(status) ? "Unpublish" : "Publish"}
                    </button>

                    {adminOwned ? (
                      <button
                        type="button"
                        disabled={!id}
                        onClick={() => void quickDeleteAdminOwned(row)}
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-danger px-3 text-xs font-semibold text-inverted shadow-sm hover:bg-danger"
                      >
                        Delete
                      </button>
                    ) : null}
                  </>
                );
              }}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt disabled:opacity-50"
              >
                Prev
              </button>

              <div className="text-sm text-secondary">
                Page <span className="font-semibold text-primary">{page}</span> /{" "}
                <span className="font-semibold text-primary">{derived.totalPages}</span>
              </div>

              <button
                type="button"
                disabled={page >= derived.totalPages}
                onClick={() => setPage((p) => Math.min(derived.totalPages, p + 1))}
                className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt disabled:opacity-50"
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
            setPage(1);
            void reload(1);
          }}
        />
      </div>
    </PortalShell>
  );
}
