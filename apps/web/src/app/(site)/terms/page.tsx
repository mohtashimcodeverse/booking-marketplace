import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Laugh & Lodge",
  description: "Terms and conditions for using the Laugh & Lodge platform.",
};

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-2xl p-5">
      <div className="text-sm font-semibold text-primary">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-secondary/80">{props.children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <section className="hero-dark-shell relative overflow-hidden border-b border-brand/25 text-inverted">
        <div className="hero-dark-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-12 sm:px-6 sm:pt-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-inverted/70">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-inverted sm:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-inverted/78 sm:text-base">
            Terms define booking behavior, platform responsibilities, and compliance expectations across guests and owners.
          </p>
        </div>
      </section>

      <section className="bg-warm-alt/88 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="space-y-6">
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
      </section>
    </main>
  );
}
