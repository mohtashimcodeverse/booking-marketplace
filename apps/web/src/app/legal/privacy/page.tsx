import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Legal"
        title="Privacy Policy"
        desc="How we collect, use, and protect your personal information."
      />

      <section className="mx-auto w-full max-w-4xl px-4 py-14 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 92%">
          <article
            data-sr
            className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.08)]"
          >
            <Meta />

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">1. What we collect</h2>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li>• Contact details (name, email, phone)</li>
              <li>• Booking details (dates, property, guest count)</li>
              <li>• Inquiry messages and support requests</li>
              <li>• Technical data (device, browser, IP address) for security and analytics</li>
            </ul>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">2. Why we collect it</h2>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li>• To respond to inquiries and provide customer support</li>
              <li>• To process and manage bookings</li>
              <li>• To improve our website, services, and user experience</li>
              <li>• To prevent fraud and secure our platform</li>
            </ul>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">3. Payments</h2>
            <p className="mt-2 text-sm text-gray-700">
              Payments are handled by third-party providers (e.g., Telr). We do not store full card details on our
              servers. Payment providers may process data according to their own policies.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">4. Sharing information</h2>
            <p className="mt-2 text-sm text-gray-700">
              We do not sell personal information. We may share data only when needed to deliver services
              (e.g., payment providers, analytics, operational partners) or to comply with legal requirements.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">5. Cookies</h2>
            <p className="mt-2 text-sm text-gray-700">
              We may use cookies or similar technologies to improve functionality, remember preferences, and understand
              website usage. You can manage cookies via your browser settings.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">6. Data retention</h2>
            <p className="mt-2 text-sm text-gray-700">
              We keep information only as long as necessary for bookings, support, legal compliance, and legitimate
              business needs.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">7. Your rights</h2>
            <p className="mt-2 text-sm text-gray-700">
              You may request access, correction, or deletion of your personal data where applicable. Contact us at{" "}
              <strong>[Email]</strong>.
            </p>

            <h2 className="mt-6 text-xl font-semibold text-[#111827]">8. Contact</h2>
            <p className="mt-2 text-sm text-gray-700">
              <strong>Rent Property UAE</strong> — <strong>Dubai, UAE</strong> — <strong>+971502348756</strong> —{" "}
              <strong>Info@rentpropertyuae.com</strong>
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
      <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Effective date</div>
      <div className="mt-1 text-sm text-gray-700">2026-01-28</div>
      <div className="mt-3 text-xs text-gray-600">
         This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new      
      </div>
    </div>
  );
}
