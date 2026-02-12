import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Laugh & Lodge",
  description: "Refund policy for stays booked with Laugh & Lodge.",
};

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-2xl p-5">
      <div className="text-sm font-semibold text-primary">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-secondary/80">{props.children}</div>
    </div>
  );
}

export default function RefundsPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <section className="hero-dark-shell relative overflow-hidden border-b border-brand/25 text-inverted">
        <div className="hero-dark-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-12 sm:px-6 sm:pt-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-inverted/70">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-inverted sm:text-4xl">
            Refund Policy
          </h1>
          <p className="mt-3 text-sm text-inverted/78 sm:text-base">
            Refund states are managed by policy rules and payment events to prevent duplicate or inconsistent outcomes.
          </p>
        </div>
      </section>

      <section className="bg-warm-alt/88 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="space-y-6">
            <Section title="When refunds apply">
              Refund eligibility depends on the booking’s cancellation policy and timing, as well as payment provider rules.
              Some bookings may be partially refundable; some may be non-refundable.
            </Section>
            <Section title="Processing time">
              If a refund is approved, processing time varies by payment provider and bank. The system records refund state
              and prevents duplicates via idempotency.
            </Section>
            <Section title="Disputes & support">
              If you believe a refund outcome is incorrect, contact Booking@rentpropertyuae.com with your booking ID
              and relevant details.
            </Section>
          </div>
        </div>
      </section>
    </main>
  );
}
