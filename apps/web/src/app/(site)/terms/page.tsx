import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Laugh & Lodge",
  description: "Terms and conditions for using the Laugh & Lodge platform.",
};

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="tourm-card rounded-2xl p-5">
      <div className="text-sm font-semibold text-midnight">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-ink/80">{props.children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm text-ink/75 sm:text-base">
          This page is a platform-ready terms placeholder. Replace with your lawyer-approved text before production.
        </p>

        <div className="mt-8 space-y-6">
          <Section title="Using the platform">
            By using this website and creating an account, you agree to comply with our policies,
            provide accurate information, and respect property rules.
          </Section>
          <Section title="Bookings and payments">
            Bookings are created by the backend engine. Confirmations for real payment providers
            are webhook-driven; the frontend does not confirm bookings.
          </Section>
          <Section title="Guest responsibilities">
            Guests must follow house rules, local regulations, and check-in requirements (including ID where required).
            Damage, excessive cleaning, or rule violations may incur charges under applicable policies.
          </Section>
          <Section title="Support">
            For assistance, contact Booking@rentpropertyuae.com or Info@rentpropertyuae.com
          </Section>
        </div>
      </div>
    </main>
  );
}
