"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { CardList, type CardListItem } from "@/components/portal/ui/CardList";
import { Modal } from "@/components/portal/ui/Modal";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import {
  createUserReview,
  downloadUserBookingDocument,
  getUserBookings,
  listUserBookingDocuments,
  uploadUserBookingDocument,
  type BookingDocumentType,
  type UserBookingDocument,
} from "@/lib/api/portal/user";
import { useCurrency } from "@/lib/currency/CurrencyProvider";

type BookingRecord = Awaited<ReturnType<typeof getUserBookings>>["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getUserBookings>> };

function toInt(value: string | null, fallback: number): number {
  const numeric = value ? Number(value) : Number.NaN;
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function AccountBookingsPage() {
  return (
    <Suspense
      fallback={
        <PortalShell
          role="customer"
          title="Bookings"
          subtitle="Your stays and booking statuses"
        >
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        </PortalShell>
      }
    >
      <AccountBookingsContent />
    </Suspense>
  );
}

function AccountBookingsContent() {
  const { status: authStatus } = useAuth();
  const searchParams = useSearchParams();

  const page = toInt(searchParams.get("page"), 1);
  const pageSize = toInt(searchParams.get("pageSize"), 10);
  const focusBookingId = searchParams.get("focus");

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { formatFromAed } = useCurrency();

  useEffect(() => {
    let alive = true;

    async function load() {
      if (authStatus === "loading") return;

      setState({ kind: "loading" });
      try {
        const data = await getUserBookings({ page, pageSize });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load bookings",
        });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [authStatus, page, pageSize]);

  const selected = useMemo<BookingRecord | null>(() => {
    if (state.kind !== "ready") return null;
    const id = selectedId ?? focusBookingId;
    if (!id) return null;
    return state.data.items.find((item) => item.id === id) ?? null;
  }, [focusBookingId, selectedId, state]);

  const listItems = useMemo<CardListItem[]>(() => {
    if (state.kind !== "ready") return [];

    return state.data.items.map((booking) => {
      return {
        id: booking.id,
        title: booking.propertyTitle ?? `Booking ${booking.id.slice(0, 8)}`,
        subtitle: `Check-in ${formatDate(booking.checkIn)} - Check-out ${formatDate(booking.checkOut)}`,
        status: <StatusPill status={booking.status}>{booking.status}</StatusPill>,
        meta: (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-warm-alt px-3 py-1 font-semibold text-secondary">
              Ref: {booking.id.slice(0, 8)}
            </span>
            <span className="rounded-full bg-warm-alt px-3 py-1 font-semibold text-secondary">
              Total: {formatFromAed(booking.totalAmount, { maximumFractionDigits: 0 })}
            </span>
          </div>
        ),
        actions: (
          <Link
            href={`/account/bookings/${booking.id}`}
            className="rounded-xl border border-line/80 bg-surface px-3 py-1.5 text-xs font-semibold text-primary hover:bg-warm-alt"
          >
            Open page
          </Link>
        ),
        onClick: () => setSelectedId(booking.id),
      };
    });
  }, [formatFromAed, state]);

  const pageMeta = useMemo(() => {
    if (state.kind !== "ready") return null;
    const totalPages = Math.max(1, Math.ceil(state.data.total / state.data.pageSize));
    return {
      totalPages,
      currentPage: state.data.page,
      pageSize: state.data.pageSize,
    };
  }, [state]);

  return (
    <PortalShell
      role="customer"
      title="Bookings"
      subtitle="Click a booking to view full details"
    >
      {state.kind === "loading" ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="space-y-5">
          <CardList
            title="My bookings"
            subtitle="Backend-driven booking states, dates, and totals"
            items={listItems}
            emptyTitle="No bookings yet"
            emptyDescription="Once you book a stay, it will appear here with live status and payment state."
          />

          {pageMeta ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary">
                Page {pageMeta.currentPage} of {pageMeta.totalPages}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/account/bookings?page=${Math.max(1, pageMeta.currentPage - 1)}&pageSize=${pageMeta.pageSize}`}
                  aria-disabled={pageMeta.currentPage <= 1}
                  className={cn(
                    "rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm",
                    pageMeta.currentPage <= 1 && "pointer-events-none opacity-50",
                  )}
                >
                  Prev
                </Link>

                <Link
                  href={`/account/bookings?page=${Math.min(pageMeta.totalPages, pageMeta.currentPage + 1)}&pageSize=${pageMeta.pageSize}`}
                  aria-disabled={pageMeta.currentPage >= pageMeta.totalPages}
                  className={cn(
                    "rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm",
                    pageMeta.currentPage >= pageMeta.totalPages && "pointer-events-none opacity-50",
                  )}
                >
                  Next
                </Link>
              </div>
            </div>
          ) : null}

          <Modal
            open={selected !== null}
            onClose={() => setSelectedId(null)}
            size="lg"
            title={selected?.propertyTitle ?? "Booking detail"}
            subtitle={selected ? `Booking ref: ${selected.id}` : undefined}
          >
            {selected ? (
              <BookingDetailPanel booking={selected} />
            ) : null}
          </Modal>
        </div>
      )}
    </PortalShell>
  );
}

function BookingDetailPanel({ booking }: { booking: BookingRecord }) {
  const { currency, formatFromAed, formatBaseAed } = useCurrency();
  const [docsState, setDocsState] = useState<
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; items: UserBookingDocument[] }
  >({ kind: "loading" });
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadType, setUploadType] = useState<BookingDocumentType>("OTHER");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [locationRating, setLocationRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPastStay = useMemo(() => {
    const d = new Date(booking.checkOut);
    return Number.isFinite(d.getTime()) && d.getTime() < Date.now();
  }, [booking.checkOut]);

  const loadDocuments = useCallback(async () => {
    setDocsState({ kind: "loading" });
    try {
      const items = await listUserBookingDocuments(booking.id);
      setDocsState({ kind: "ready", items });
    } catch (e) {
      setDocsState({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to load documents",
      });
    }
  }, [booking.id]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function uploadDocument() {
    if (!uploadFile) {
      setError("Please choose a document file first.");
      return;
    }
    setError(null);
    setMessage(null);
    setUploadBusy(true);
    try {
      await uploadUserBookingDocument(booking.id, {
        file: uploadFile,
        type: uploadType,
        notes: uploadNotes,
      });
      setUploadFile(null);
      setUploadNotes("");
      setUploadType("OTHER");
      setMessage("Document uploaded successfully.");
      await loadDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }

  async function downloadDocument(doc: UserBookingDocument) {
    setError(null);
    try {
      const blob = await downloadUserBookingDocument(booking.id, doc.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.originalName || `booking-document-${doc.id}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    }
  }

  async function submitReview() {
    setError(null);
    setMessage(null);
    setReviewBusy(true);
    try {
      await createUserReview({
        bookingId: booking.id,
        cleanlinessRating,
        locationRating,
        communicationRating,
        valueRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setMessage("Review submitted. It will be visible after moderation.");
      setReviewTitle("");
      setReviewComment("");
      setCleanlinessRating(5);
      setLocationRating(5);
      setCommunicationRating(5);
      setValueRating(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review submission failed");
    } finally {
      setReviewBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={booking.status}>{booking.status}</StatusPill>
        <span className="rounded-full bg-warm-alt px-3 py-1 text-xs font-semibold text-secondary">
          Total: {formatFromAed(booking.totalAmount, { maximumFractionDigits: 0 })}
        </span>
        {currency !== "AED" ? (
          <span className="rounded-full bg-warm-alt px-3 py-1 text-xs font-semibold text-secondary">
            Base: {formatBaseAed(booking.totalAmount)}
          </span>
        ) : null}
      </div>

      {message ? (
        <div className="rounded-2xl border border-success/30 bg-success/12 p-3 text-sm text-success">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/12 p-3 text-sm text-danger">{error}</div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line/80 bg-warm-base p-4">
          <div className="text-xs font-semibold text-muted">Check-in</div>
          <div className="mt-1 text-sm font-semibold text-primary">{formatDate(booking.checkIn)}</div>
        </div>
        <div className="rounded-2xl border border-line/80 bg-warm-base p-4">
          <div className="text-xs font-semibold text-muted">Check-out</div>
          <div className="mt-1 text-sm font-semibold text-primary">{formatDate(booking.checkOut)}</div>
        </div>
      </div>

      <section className="rounded-2xl border border-line/80 bg-surface p-4">
        <div className="text-sm font-semibold text-primary">Upload required documents</div>
        <div className="mt-1 text-xs text-secondary">
          Documents stay private and are only available to you and admin operators.
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-muted">Type</span>
            <select
              value={uploadType}
              onChange={(event) => setUploadType(event.target.value as BookingDocumentType)}
              className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
            >
              <option value="PASSPORT">Passport</option>
              <option value="EMIRATES_ID">Emirates ID</option>
              <option value="VISA">Visa</option>
              <option value="ARRIVAL_FORM">Arrival form</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-muted">Notes (optional)</span>
            <input
              value={uploadNotes}
              onChange={(event) => setUploadNotes(event.target.value)}
              placeholder="Extra info for admin..."
              className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="file"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            className="max-w-full text-sm text-secondary"
          />
          <button
            type="button"
            disabled={uploadBusy}
            onClick={() => void uploadDocument()}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
          >
            {uploadBusy ? "Uploading..." : "Upload"}
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {docsState.kind === "loading" ? (
            <div className="space-y-2">
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
            </div>
          ) : docsState.kind === "error" ? (
            <div className="rounded-xl border border-danger/30 bg-danger/12 p-3 text-sm text-danger">
              {docsState.message}
            </div>
          ) : docsState.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line/80 bg-warm-alt p-3 text-sm text-secondary">
              No documents uploaded yet.
            </div>
          ) : (
            docsState.items.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-line/80 bg-warm-base p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-primary">{doc.originalName}</div>
                  <div className="mt-1 text-xs text-secondary">
                    {doc.type} • {Math.max(1, Math.round((doc.sizeBytes ?? 0) / 1024))} KB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void downloadDocument(doc)}
                  className="shrink-0 rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {isPastStay ? (
        <section className="rounded-2xl border border-line/80 bg-surface p-4">
          <div className="text-sm font-semibold text-primary">Leave a review</div>
          <div className="mt-1 text-xs text-secondary">
            Reviews are accepted for past stays and moderated by admin before public display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-muted">Cleanliness</span>
              <select
                value={String(cleanlinessRating)}
                onChange={(event) => setCleanlinessRating(Number(event.target.value))}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-muted">Location</span>
              <select
                value={String(locationRating)}
                onChange={(event) => setLocationRating(Number(event.target.value))}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-muted">Communication</span>
              <select
                value={String(communicationRating)}
                onChange={(event) => setCommunicationRating(Number(event.target.value))}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-muted">Value</span>
              <select
                value={String(valueRating)}
                onChange={(event) => setValueRating(Number(event.target.value))}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-muted">Title (optional)</span>
              <input
                value={reviewTitle}
                onChange={(event) => setReviewTitle(event.target.value)}
                placeholder="Short review title"
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
              />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted">Comment (optional)</span>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share your stay experience..."
              className="mt-1 w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary"
            />
          </label>
          <button
            type="button"
            disabled={reviewBusy}
            onClick={() => void submitReview()}
            className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:opacity-95 disabled:opacity-60"
          >
            {reviewBusy ? "Submitting..." : "Submit review"}
          </button>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {booking.propertySlug ? (
          <Link
            href={`/properties/${booking.propertySlug}`}
            className="inline-flex rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
          >
            View property
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}
