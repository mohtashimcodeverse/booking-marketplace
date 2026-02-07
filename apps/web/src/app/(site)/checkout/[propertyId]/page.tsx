import Link from "next/link";
import { CreateBookingCardBatchA } from "@/components/checkout/CreateBookingCardBatchA";

type PageProps = {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{
    holdId?: string;
    slug?: string;
    guests?: string;
    checkIn?: string;
    checkOut?: string;
  }>;
};

export default async function CheckoutPage(props: PageProps) {
  const { propertyId } = await props.params;
  const sp = await props.searchParams;

  const holdId = (sp.holdId ?? "").trim();
  const slug = (sp.slug ?? "").trim();

  const guestsRaw = (sp.guests ?? "").trim();
  const guestsNum = Number(guestsRaw);
  const guestsSafe = Number.isFinite(guestsNum) && guestsNum >= 1 ? guestsNum : 2;

  const backToPropertyHref = slug ? `/properties/${encodeURIComponent(slug)}` : `/properties`;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Checkout</h1>
            <p className="mt-2 text-sm text-slate-700">
              Convert your hold into a booking. Booking becomes <span className="font-semibold">CONFIRMED</span> only
              after verified payment webhooks (later).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={backToPropertyHref}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Back to property
            </Link>

            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Browse stays
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Your reservation flow</div>
              <p className="mt-1 text-xs text-slate-600">
                Frank Porter–style: hold prevents double-booking, booking is payment-gated and webhook-confirmed.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900">
                Property ID: <span className="font-mono">{propertyId}</span>
              </div>

              {holdId ? (
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900">
                  Hold ID: <span className="font-mono">{holdId}</span>
                </div>
              ) : null}
            </div>
          </div>

          <ol className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <li className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">Step 1</div>
              <div className="mt-1 font-semibold text-slate-900">Hold created</div>
              <div className="mt-1 text-xs text-slate-600">Inventory is reserved temporarily.</div>
            </li>

            <li className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">Step 2</div>
              <div className="mt-1 font-semibold text-slate-900">Create booking</div>
              <div className="mt-1 text-xs text-slate-600">Status: PENDING_PAYMENT</div>
            </li>

            <li className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">Step 3</div>
              <div className="mt-1 font-semibold text-slate-900">Hosted payment</div>
              <div className="mt-1 text-xs text-slate-600">Webhooks confirm booking.</div>
            </li>
          </ol>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
            <span className="font-semibold">Important:</span> if payment fails or expires, the booking may be cancelled
            automatically and availability is released safely.
          </div>
        </div>

        {!holdId ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <div className="font-semibold">No hold found</div>
            <p className="mt-2 text-amber-900/80">
              This page requires <span className="font-semibold">holdId</span>. Go back to the property, select dates,
              and click <span className="font-semibold">Reserve (hold inventory)</span>.
            </p>

            <div className="mt-4">
              <Link
                href={backToPropertyHref}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to property
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <CreateBookingCardBatchA propertyId={propertyId} holdId={holdId} guests={guestsSafe} />
          </div>
        )}
      </div>
    </main>
  );
}
