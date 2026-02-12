import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy | Laugh & Lodge",
  description: "Cancellation policy for stays booked with Laugh & Lodge.",
};

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-2xl p-5">
      <div className="text-sm font-semibold text-primary">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-secondary/80">{props.children}</div>
    </div>
  );
}

export default function CancellationPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <section className="hero-dark-shell relative overflow-hidden border-b border-brand/25 text-inverted">
        <div className="hero-dark-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-12 sm:px-6 sm:pt-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-inverted/70">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-inverted sm:text-4xl">
            Cancellation Policy
          </h1>
          <p className="mt-3 text-sm text-inverted/78 sm:text-base">
            Policy windows, cutoffs, and outcomes are enforced server-side to keep cancellation decisions auditable and consistent.
          </p>
        </div>
      </section>

      <section className="bg-warm-alt/88 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="space-y-6">
            <Section title="Policy-driven enforcement">
              Cancellations are validated and processed by the backend policy engine. The policy applied to a booking
              is snapshotted at booking time for auditability.
            </Section>
            <Section title="Cutoff windows">
              Some bookings may be refundable before a cutoff date/time and non-refundable after.
              The exact rules can vary by property and rate plan.
            </Section>
            <Section title="How to cancel">
              Use your account dashboard to cancel a booking. If cancellation is allowed, the system will calculate
              the outcome based on the stored policy.
            </Section>
          </div>
        </div>
      </section>
    </main>
  );
}
