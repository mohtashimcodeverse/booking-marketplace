import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function RefundPolicyPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Legal"
        title="Refund Policy"
        desc="How refunds are calculated and processed."
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

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">1. Eligibility</h2>
            <p className="mt-2 text-sm text-gray-700">
              Refund eligibility depends on the cancellation policy shown at booking and the timing of your cancellation.
              Some bookings may be non-refundable.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">2. Processing timeline</h2>
            <p className="mt-2 text-sm text-gray-700">
              If approved, refunds are returned to the original payment method. Processing time depends on your bank or
              payment provider. We aim to initiate refunds promptly after confirmation.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">3. Fees</h2>
            <p className="mt-2 text-sm text-gray-700">
              Certain fees (e.g., platform fees, payment processing costs, or non-refundable rate components) may not be
              refundable depending on your booking terms.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">4. Chargebacks</h2>
            <p className="mt-2 text-sm text-gray-700">
              If you initiate a chargeback without contacting us first, we may be unable to process a standard refund
              until the dispute is resolved by the payment provider.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">5. Contact</h2>
            <p className="mt-2 text-sm text-gray-700">
              For refund questions, contact <strong>Info@rentpropertyuae.com</strong>.
            </p>
          </article>
        </ScrollReveal>
      </section>
    </div>
  );
}
