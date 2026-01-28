import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function CancellationPolicyPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Legal"
        title="Cancellation Policy"
        desc="Clear rules to protect guests, owners, and operations."
      />

      <section className="mx-auto w-full max-w-4xl px-4 py-14 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 92%">
          <article
            data-sr
            className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.08)]"
          >
            <div className="rounded-[22px] border border-black/10 bg-[#F7F4EE] p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Last updated</div>
              <div className="mt-1 text-sm text-gray-700">2026-01-28</div>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">1. Standard cancellation window</h2>
            <p className="mt-2 text-sm text-gray-700">
              Unless otherwise stated on the property page or booking confirmation, our standard policy is:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>• Cancel <strong>14 days or more</strong> before check-in → eligible for a refund (see Refund Policy).</li>
              <li>• Cancel <strong>less than 14 days</strong> before check-in → may be non-refundable.</li>
            </ul>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">2. Exceptions</h2>
            <p className="mt-2 text-sm text-gray-700">
              Some properties, peak dates, or promotional rates may have different cancellation rules. The booking
              confirmation and property page will prevail.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">3. Changes to bookings</h2>
            <p className="mt-2 text-sm text-gray-700">
              Changes (dates, guest count, extensions) are subject to availability and may result in rate changes.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">4. No-shows and early check-out</h2>
            <p className="mt-2 text-sm text-gray-700">
              No-shows or early departures may not be eligible for refunds unless required by law or explicitly stated
              in your booking terms.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">5. Contact</h2>
            <p className="mt-2 text-sm text-gray-700">
              If you need assistance, contact <strong>Info@rentpropertyuae.com</strong> or <strong>+971502348756</strong>.
            </p>
          </article>
        </ScrollReveal>
      </section>
    </div>
  );
}
