"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalAvailabilityCalendar } from "@/components/portal/calendar/PortalAvailabilityCalendar";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";

import { getAdminCalendar, getAdminPortalPropertyDetail } from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Record<string, unknown> };

type PropertyDocument = {
  id: string;
  type: string;
  originalName: string | null;
  downloadUrl: string;
  createdAt: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getString(value: unknown, key: string): string | null {
  const record = asRecord(value);
  if (!record) return null;
  const field = record[key];
  return typeof field === "string" ? field : null;
}

function getNumber(value: unknown, key: string): number | null {
  const record = asRecord(value);
  if (!record) return null;
  const field = record[key];
  return typeof field === "number" && Number.isFinite(field) ? field : null;
}

function getArray(value: unknown, key: string): unknown[] {
  const record = asRecord(value);
  if (!record) return [];
  const field = record[key];
  return Array.isArray(field) ? field : [];
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminPropertyDetailPage() {
  const params = useParams<{ propertyId: string }>();
  const propertyId = typeof params?.propertyId === "string" ? params.propertyId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!propertyId) return;
      setState({ kind: "loading" });
      try {
        const data = await getAdminPortalPropertyDetail(propertyId);
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load property detail",
        });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [propertyId]);

  const media = useMemo(
    () => getArray(state.kind === "ready" ? state.data : null, "media").map((item) => asRecord(item)).filter(Boolean) as Record<string, unknown>[],
    [state]
  );

  const documents = useMemo(() => {
    return getArray(state.kind === "ready" ? state.data : null, "documents")
      .map((item) => {
        const record = asRecord(item);
        if (!record) return null;
        const id = getString(record, "id");
        const downloadUrl = getString(record, "downloadUrl");
        if (!id || !downloadUrl) return null;
        return {
          id,
          type: getString(record, "type") || "OTHER",
          originalName: getString(record, "originalName"),
          downloadUrl,
          createdAt: getString(record, "createdAt") || "",
        } satisfies PropertyDocument;
      })
      .filter(Boolean) as PropertyDocument[];
  }, [state]);

  async function downloadAllImages() {
    if (media.length === 0) return;
    media.forEach((item, idx) => {
      const url = getString(item, "url");
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.download = `property-image-${idx + 1}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  return (
    <PortalShell
      role="admin"
      title="Property Detail"
      subtitle="Media, calendar, documents, and policy-aware admin controls"
      right={(
        <Link
          href="/admin/properties"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to properties
        </Link>
      )}
    >
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-60" />
          <SkeletonBlock className="h-60" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">{getString(state.data, "title") || "Untitled"}</h2>
                <div className="mt-1 text-sm text-secondary">
                  {[getString(state.data, "area"), getString(state.data, "city")].filter(Boolean).join(", ")}
                </div>
              </div>
              <StatusPill status={getString(state.data, "status") || "UNKNOWN"}>
                {getString(state.data, "status") || "UNKNOWN"}
              </StatusPill>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Base price" value={`${getNumber(state.data, "basePrice") ?? 0} ${getString(state.data, "currency") ?? "AED"}`} />
              <Info label="Guests" value={String(getNumber(state.data, "maxGuests") ?? 0)} />
              <Info label="Bedrooms" value={String(getNumber(state.data, "bedrooms") ?? 0)} />
              <Info label="Bathrooms" value={String(getNumber(state.data, "bathrooms") ?? 0)} />
              <Info label="Vendor" value={getString(asRecord(state.data.vendor), "email") || "-"} />
              <Info label="Created" value={formatDate(getString(state.data, "createdAt"))} />
              <Info label="Updated" value={formatDate(getString(state.data, "updatedAt"))} />
              <Info
                label="Ownership policy"
                value={
                  getString(state.data, "createdByAdminId")
                    ? "Admin-owned listing"
                    : "Vendor-owned core fields are restricted"
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-primary">Images</div>
              <button
                type="button"
                onClick={() => void downloadAllImages()}
                disabled={media.length === 0}
                className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
              >
                Download all images
              </button>
            </div>

            {media.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                No images uploaded.
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {media.map((item) => {
                  const mediaId =
                    getString(item, "id") ||
                    getString(item, "url") ||
                    `${getString(item, "category") || "media"}-${getNumber(item, "sortOrder") ?? 0}`;
                  const url = getString(item, "url");
                  return (
                    <div key={mediaId} className="overflow-hidden rounded-2xl border border-line/70 bg-warm-base">
                      <div className="aspect-[4/3] w-full bg-bg-2">
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt={getString(item, "alt") || "Property photo"} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="p-3 text-xs text-secondary">
                        {getString(item, "category") || "OTHER"} · Order {getNumber(item, "sortOrder") ?? 0}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Calendar</div>
            <div className="mt-3">
              <PortalAvailabilityCalendar
                role="admin"
                loadData={async ({ from, to }) =>
                  getAdminCalendar({ from, to, propertyId })
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Property documents</div>
            {documents.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                No documents uploaded.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.downloadUrl}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line/70 bg-warm-base p-3 text-sm text-primary transition hover:bg-accent-soft/40"
                  >
                    <span>{doc.originalName || `${doc.type} (${doc.id.slice(0, 8)})`}</span>
                    <span className="text-xs text-secondary">{formatDateTime(doc.createdAt)}</span>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PortalShell>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-3">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-primary">{props.value}</div>
    </div>
  );
}
