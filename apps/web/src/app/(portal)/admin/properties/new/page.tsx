"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Save, UploadCloud } from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { AdminPropertyMediaManager } from "@/components/portal/admin/properties/AdminPropertyMediaManager";

import {
  createAdminProperty,
  getAdminPropertyDetail,
  getAdminAmenitiesCatalog,
  updateAdminPropertyMediaCategory,
  updateAdminPropertyAmenities,
  uploadAdminPropertyMedia,
  type AdminPropertyCreateInput,
  type AdminPropertyDetail,
  type MediaCategory,
} from "@/lib/api/portal/admin";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toInt(value: string): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toFloat(value: string): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

type AmenitiesGroup = Awaited<ReturnType<typeof getAdminAmenitiesCatalog>>["amenitiesGrouped"][number];

const ADMIN_MEDIA_CATEGORIES: MediaCategory[] = [
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

export default function AdminPropertyCreatePage() {
  const inputClass =
    "h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15";

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<AdminPropertyDetail | null>(null);
  const quickUploadInputRef = useRef<HTMLInputElement | null>(null);

  const [amenitiesGroups, setAmenitiesGroups] = useState<AmenitiesGroup[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [quickUploadCategory, setQuickUploadCategory] = useState<MediaCategory>("LIVING_ROOM");

  const [form, setForm] = useState({
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

    publishNow: true,
  });

  useEffect(() => {
    let alive = true;

    async function loadAmenities() {
      try {
        const catalog = await getAdminAmenitiesCatalog();
        if (!alive) return;
        setAmenitiesGroups(catalog.amenitiesGrouped ?? []);
      } catch {
        // keep UI usable even if catalog load fails
      }
    }

    void loadAmenities();
    return () => {
      alive = false;
    };
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function toggleAmenity(id: string) {
    setSelectedAmenityIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  const canCreateProperty = useMemo(() => {
    if (!form.title.trim() || !form.slug.trim()) return false;
    if (toInt(form.maxGuests) === null) return false;
    if (toInt(form.bedrooms) === null) return false;
    if (toInt(form.bathrooms) === null) return false;
    if (toFloat(form.basePrice) === null) return false;
    return true;
  }, [form]);

  const canSubmit = useMemo(() => {
    if (busy) return false;
    if (property) return false;
    return canCreateProperty;
  }, [busy, property, canCreateProperty]);

  function buildCreatePayload(): AdminPropertyCreateInput {
    return {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,

      city: form.city.trim(),
      area: form.area.trim() || null,
      address: form.address.trim() || null,
      lat: toFloat(form.lat),
      lng: toFloat(form.lng),

      maxGuests: toInt(form.maxGuests) ?? 1,
      bedrooms: toInt(form.bedrooms) ?? 0,
      bathrooms: toInt(form.bathrooms) ?? 0,

      basePrice: toFloat(form.basePrice) ?? 0,
      cleaningFee: toFloat(form.cleaningFee),
      currency: form.currency.trim() || "AED",

      minNights: toInt(form.minNights),
      maxNights: toInt(form.maxNights),

      vendorId: null,
      publishNow: form.publishNow,
    };
  }

  async function createPropertyRecord(): Promise<AdminPropertyDetail> {
    const created = await createAdminProperty(buildCreatePayload());
    if (selectedAmenityIds.length === 0) {
      return created;
    }
    return updateAdminPropertyAmenities(created.id, selectedAmenityIds);
  }

  async function saveAmenities(propertyId: string) {
    setError(null);
    setBusy("Saving amenities...");

    try {
      const updated = await updateAdminPropertyAmenities(propertyId, selectedAmenityIds);
      setProperty(updated);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save amenities");
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    setError(null);
    setBusy("Creating property...");
    try {
      const created = await createPropertyRecord();
      setProperty(created);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Create failed");
    } finally {
      setBusy(null);
    }
  }

  async function quickUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    if (!property && !canCreateProperty) {
      setError("Fill required property fields first (name, slug, guests, rooms, bathrooms, and base price).");
      if (quickUploadInputRef.current) {
        quickUploadInputRef.current.value = "";
      }
      return;
    }

    let target = property;
    try {
      if (!target) {
        setBusy("Creating property...");
        target = await createPropertyRecord();
      }

      setBusy("Uploading photos...");
      for (const file of Array.from(files)) {
        const createdMedia = await uploadAdminPropertyMedia(target.id, file);
        await updateAdminPropertyMediaCategory(target.id, createdMedia.id, quickUploadCategory);
      }

      const refreshed = await getAdminPropertyDetail(target.id);
      setProperty(refreshed);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Photo upload failed");
    } finally {
      setBusy(null);
      if (quickUploadInputRef.current) {
        quickUploadInputRef.current.value = "";
      }
    }
  }

  return (
    <PortalShell
      role="admin"
      title="Create Property"
      subtitle="Admin-owned listing flow with immediate publish control"
      right={
        <Link
          href="/admin/properties"
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to properties
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <StatusPill tone="success">Admin owned</StatusPill>
          <StatusPill tone={property ? "success" : "warning"}>
            {property ? "Created" : "Draft setup"}
          </StatusPill>
          <StatusPill tone={form.publishNow ? "success" : "neutral"}>
            {form.publishNow ? "Publish immediately" : "Save approved"}
          </StatusPill>
        </div>

        {busy ? (
          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-[#f6f3ec] p-4 text-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            {busy}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {!property ? (
          <>
            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Property basics</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Property name" required>
                  <input
                    value={form.title}
                    onChange={(event) => {
                      update("title", event.target.value);
                      if (!form.slug) update("slug", slugify(event.target.value));
                    }}
                    className={inputClass}
                    placeholder="e.g., Marina View Residence"
                  />
                </Field>

                <Field label="Slug" required>
                  <input
                    value={form.slug}
                    onChange={(event) => update("slug", slugify(event.target.value))}
                    className={`${inputClass} font-mono`}
                    placeholder="marina-view-residence"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={(event) => update("description", event.target.value)}
                      className="min-h-[100px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                      placeholder="Describe the stay, design style, and highlights"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Location & map pin</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="City" required>
                  <input
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    className={inputClass}
                    placeholder="Dubai"
                  />
                </Field>

                <Field label="Area">
                  <input
                    value={form.area}
                    onChange={(event) => update("area", event.target.value)}
                    className={inputClass}
                    placeholder="e.g., JBR"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Address">
                  <input
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    className={inputClass}
                    placeholder="Building, street, tower"
                  />
                </Field>
                </div>

                <Field label="Latitude">
                  <input
                    value={form.lat}
                    onChange={(event) => update("lat", event.target.value)}
                    className={inputClass}
                    placeholder="25.2048"
                  />
                </Field>

                <Field label="Longitude">
                  <input
                    value={form.lng}
                    onChange={(event) => update("lng", event.target.value)}
                    className={inputClass}
                    placeholder="55.2708"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Capacity & pricing</div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="Max guests" required>
                  <input value={form.maxGuests} onChange={(event) => update("maxGuests", event.target.value)} className={inputClass} />
                </Field>

                <Field label="Bedrooms" required>
                  <input value={form.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} className={inputClass} />
                </Field>

                <Field label="Bathrooms" required>
                  <input value={form.bathrooms} onChange={(event) => update("bathrooms", event.target.value)} className={inputClass} />
                </Field>

                <Field label="Base price" required>
                  <input value={form.basePrice} onChange={(event) => update("basePrice", event.target.value)} className={inputClass} />
                </Field>

                <Field label="Cleaning fee">
                  <input value={form.cleaningFee} onChange={(event) => update("cleaningFee", event.target.value)} className={inputClass} />
                </Field>

                <Field label="Currency">
                  <input value={form.currency} onChange={(event) => update("currency", event.target.value)} className={inputClass} />
                </Field>

                <Field label="Min nights">
                  <input value={form.minNights} onChange={(event) => update("minNights", event.target.value)} className={inputClass} />
                </Field>

                <Field label="Max nights">
                  <input value={form.maxNights} onChange={(event) => update("maxNights", event.target.value)} className={inputClass} />
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Amenities</div>
                  <div className="mt-1 text-sm text-slate-600">Uses the same catalog as vendor listings.</div>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Selected: {selectedAmenityIds.length}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {amenitiesGroups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/20 bg-[#f6f3ec] p-4 text-sm text-slate-700">
                    Amenity catalog is unavailable right now. You can still create the property and add amenities later.
                  </div>
                ) : (
                  amenitiesGroups.map((group) => (
                    <div key={group.group?.id ?? "ungrouped"} className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-900">{group.group?.name ?? "Other"}</div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {group.amenities.map((amenity) => {
                          const selected = selectedAmenityIds.includes(amenity.id);
                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => toggleAmenity(amenity.id)}
                              className={cn(
                                "rounded-xl border px-3 py-2 text-left text-sm font-medium",
                                selected
                                  ? "border-[#16A6C8]/40 bg-[#16A6C8]/10 text-slate-900"
                                  : "border-black/10 bg-white text-slate-700 hover:bg-slate-50",
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
            </section>

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Photos</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Upload images during creation. If the property does not exist yet, first upload will create it using current form values.
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <Field label="Default upload category">
                  <select
                    value={quickUploadCategory}
                    onChange={(event) => setQuickUploadCategory(event.target.value as MediaCategory)}
                    className={inputClass}
                  >
                    {ADMIN_MEDIA_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex items-end">
                  <input
                    ref={quickUploadInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="admin-new-property-quick-upload"
                    onChange={(event) => void quickUpload(event.target.files)}
                    disabled={busy !== null}
                  />
                  <label
                    htmlFor="admin-new-property-quick-upload"
                    className={cn(
                      "inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-sm",
                      busy ? "bg-slate-300" : "bg-[#16A6C8] hover:opacity-95",
                    )}
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload images
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-[#f6f3ec] p-4">
                <input
                  type="checkbox"
                  checked={form.publishNow}
                  onChange={(event) => update("publishNow", event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#16A6C8]"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Publish immediately after create</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Admin-owned properties can publish instantly. Disable this to keep status as APPROVED.
                  </div>
                </div>
              </label>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!canSubmit}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-sm",
                    canSubmit ? "bg-[#16A6C8] hover:opacity-95" : "bg-slate-300",
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Create property
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-6">
            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Property created</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Continue with media and amenities to finalize listing quality.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusPill tone="success">{String(property.status ?? "APPROVED")}</StatusPill>
                  <Link
                    href="/admin/properties"
                    className="inline-flex rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Done
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-4 text-sm font-semibold text-slate-900">Amenities</div>
              <div className="space-y-4">
                {amenitiesGroups.map((group) => (
                  <div key={group.group?.id ?? "ungrouped"} className="rounded-2xl border border-black/10 p-4">
                    <div className="text-sm font-semibold text-slate-900">{group.group?.name ?? "Other"}</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {group.amenities.map((amenity) => {
                        const selected = selectedAmenityIds.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            className={cn(
                              "rounded-xl border px-3 py-2 text-left text-sm font-medium",
                              selected
                                ? "border-[#16A6C8]/40 bg-[#16A6C8]/10 text-slate-900"
                                : "border-black/10 bg-white text-slate-700 hover:bg-slate-50",
                            )}
                          >
                            {amenity.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void saveAmenities(property.id)}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  <Save className="h-4 w-4" />
                  Save amenities
                </button>
              </div>
            </section>

            <AdminPropertyMediaManager
              propertyId={property.id}
              initialMedia={Array.isArray(property.media) ? property.media : []}
            />
          </div>
        )}
      </div>
    </PortalShell>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-slate-600">
        {props.label}
        {props.required ? " *" : ""}
      </div>
      {props.children}
    </label>
  );
}
