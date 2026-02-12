import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Laugh & Lodge",
  description: "Privacy and cookie policy for Laugh & Lodge Vocation Homes Rental LLC.",
};

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-2xl p-5">
      <div className="text-sm font-semibold text-primary">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-secondary/80">{props.children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <section className="hero-dark-shell relative overflow-hidden border-b border-brand/25 text-inverted">
        <div className="hero-dark-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-12 sm:px-6 sm:pt-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-inverted/70">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-inverted sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-inverted/78 sm:text-base">
            Data handling, consent, and retention are defined to keep guest and owner information protected and accountable.
          </p>
        </div>
      </section>

      <section className="bg-warm-alt/88 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="space-y-6">
            <Section title="What we collect">
              Account details (email, name), booking details (dates, guest counts), and operational metadata
              needed to provide and support stays. Payment details are handled by payment providers (where applicable).
            </Section>
            <Section title="How we use data">
              We use data to process bookings, prevent fraud/abuse, provide support, and operate services (e.g., cleaning tasks).
              We do not sell personal data.
            </Section>
            <Section title="Cookies & tracking">
              We may use cookies for session management and analytics. You can control cookies in your browser settings.
            </Section>
            <Section title="Contact">
              For privacy requests, contact: Info@rentpropertyuae.com
            </Section>
          </div>
        </div>
      </section>
    </main>
  );
}
