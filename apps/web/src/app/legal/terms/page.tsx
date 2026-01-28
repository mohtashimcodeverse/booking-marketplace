import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function TermsPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Legal"
        title="Terms & Conditions"
        desc="Please read these terms carefully before using our website or making a booking."
      />

      <section className="mx-auto w-full max-w-4xl px-4 py-14 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 92%">
          <article
            data-sr
            className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.08)]"
          >
            <Meta />

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">1. About us</h2>
            <p className="mt-2 text-sm text-gray-700">
              This website is operated by <strong>Rent Property UAE</strong> . We provide
              short-term rental management services for owners and facilitate guest bookings for listed properties.
              Replace the company details before launch.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">2. Using the website</h2>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li>• You agree to provide accurate information when submitting inquiries or bookings.</li>
              <li>• You must not misuse the website, attempt unauthorized access, or disrupt service availability.</li>
              <li>• We may update the website and its content without notice.</li>
            </ul>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">3. Bookings</h2>
            <p className="mt-2 text-sm text-gray-700">
              Bookings are subject to availability and confirmation. Certain properties may have specific rules,
              minimum stays, deposits, or identification requirements. You must review the property details and house
              rules before confirming a reservation.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">4. Payments</h2>
            <p className="mt-2 text-sm text-gray-700">
              Payments are processed via a third-party payment gateway (e.g., Telr or other providers). We do not store
              full payment card details on our servers. Payment authorizations, settlements, and refund timing may be
              subject to your bank/payment provider.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">5. Cancellations & refunds</h2>
            <p className="mt-2 text-sm text-gray-700">
              Cancellations and refunds are governed by our Cancellation Policy and Refund Policy. Certain bookings may
              be non-refundable depending on the selected rate plan or promotional terms.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">6. Property rules, damage & conduct</h2>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li>• Guests must follow house rules and local regulations.</li>
              <li>• Guests may be responsible for damages, excessive cleaning, missing items, or rule violations.</li>
              <li>• We may require a security deposit or pre-authorization depending on the booking.</li>
            </ul>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">7. Limitation of liability</h2>
            <p className="mt-2 text-sm text-gray-700">
              To the extent permitted by law, we are not liable for indirect or consequential losses. Our liability is
              limited to the amount paid for the booking in question, except where prohibited by law.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">8. Changes to these terms</h2>
            <p className="mt-2 text-sm text-gray-700">
              We may update these terms from time to time. The “Last updated” date will reflect changes.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">9. Contact</h2>
            <p className="mt-2 text-sm text-gray-700">
              For questions, contact us at <strong>Info@rentpropertyuae.com</strong> or <strong>+971502348756</strong>.
            </p>
          </article>
        </ScrollReveal>
      </section>
    </div>
  );
}

function Meta() {
  return (
    <div className="rounded-[22px] border border-black/10 bg-[#F7F4EE] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Last updated</div>
      <div className="mt-1 text-sm text-gray-700">2026-01-28</div>
      <div className="mt-3 text-xs text-gray-600">
        This Terms of Service may be updated from time to time. We will notify you of any changes by posting the new
        terms on this page.
      </div>
    </div>
  );
}
