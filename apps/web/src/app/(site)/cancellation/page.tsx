import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy | Laugh & Lodge",
  description: "Cancellation policy for stays booked with Laugh & Lodge.",
};

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="tourm-card rounded-2xl p-5">
      <div className="text-sm font-semibold text-midnight">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-ink/80">{props.children}</div>
    </div>
  );
}

export default function CancellationPage() {
  return (
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
          Cancellation Policy
        </h1>
        <p className="mt-3 text-sm text-ink/75 sm:text-base">
          This is a placeholder. Your backend already enforces cancellation rules via policy snapshots;
          this page should mirror your final legal policy before production.
        </p>

        <div className="mt-8 space-y-6">
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
    </main>
  );
}
