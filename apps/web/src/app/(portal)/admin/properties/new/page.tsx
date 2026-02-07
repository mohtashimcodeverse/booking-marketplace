"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ImagePlus } from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { AdminPropertyMediaManager } from "@/components/portal/admin/properties/AdminPropertyMediaManager";

import { createAdminProperty, type AdminPropertyCreateInput } from "@/lib/api/portal/admin";

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

export default function AdminPropertyCreatePage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    city: "Dubai",
    maxGuests: "2",
    bedrooms: "1",
    bathrooms: "1",
    basePrice: "25000",
    cleaningFee: "0",
    currency: "PKR",
    publishNow: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const canSubmit = useMemo(() => {
    if (busy || propertyId) return false;
    if (!form.title.trim() || !form.slug.trim()) return false;
    if (toInt(form.maxGuests) === null) return false;
    if (toFloat(form.basePrice) === null) return false;
    return true;
  }, [form, busy, propertyId]);

  async function submit() {
    setError(null);

    const payload: AdminPropertyCreateInput = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: null,
      city: form.city,
      area: null,
      address: null,
      lat: null,
      lng: null,
      maxGuests: toInt(form.maxGuests)!,
      bedrooms: toInt(form.bedrooms)!,
      bathrooms: toInt(form.bathrooms)!,
      basePrice: toFloat(form.basePrice)!,
      cleaningFee: toFloat(form.cleaningFee),
      currency: form.currency,
      minNights: null,
      maxNights: null,
      vendorId: null,
      publishNow: form.publishNow,
    };

    setBusy("Creating property…");
    try {
      const created = await createAdminProperty(payload);
      setPropertyId(created.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <PortalShell
      role="admin"
      title="Create Property"
      subtitle="Create listing → upload images → review → publish"
      right={
        <Link
          href="/admin/properties"
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <StatusPill tone="neutral">Admin</StatusPill>
          <StatusPill tone={propertyId ? "success" : "warning"}>
            {propertyId ? "Created" : "Draft"}
          </StatusPill>
        </div>

        {busy && (
          <div className="rounded-2xl bg-[#f6f3ec] p-4 text-sm flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {busy}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        {!propertyId && (
          <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => {
                update("title", e.target.value);
                if (!form.slug) update("slug", slugify(e.target.value));
              }}
              className="w-full h-11 rounded-2xl border px-4"
            />
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => update("slug", slugify(e.target.value))}
              className="w-full h-11 rounded-2xl border px-4 font-mono"
            />

            <button
              disabled={!canSubmit}
              onClick={submit}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white",
                canSubmit ? "bg-[#16A6C8]" : "bg-slate-300"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Create & continue
            </button>
          </div>
        )}

        {propertyId && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-[#16A6C8]" />
              <div className="text-sm font-semibold">
                Upload images for this property
              </div>
            </div>

            <AdminPropertyMediaManager propertyId={propertyId} />

            <div className="flex justify-end gap-2">
              <Link
                href="/admin/properties"
                className="inline-flex h-11 items-center rounded-2xl border px-5 text-sm font-semibold"
              >
                Done
              </Link>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
