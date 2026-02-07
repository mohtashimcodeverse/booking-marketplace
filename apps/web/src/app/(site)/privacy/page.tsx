import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Laugh & Lodge",
  description: "Privacy and cookie policy for Laugh & Lodge Vocation Homes Rental LLC.",
};

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="tourm-card rounded-2xl p-5">
      <div className="text-sm font-semibold text-midnight">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-ink/80">{props.children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink/75 sm:text-base">
          This page is a platform-ready privacy policy placeholder. Replace with your lawyer-approved
          text before production.
        </p>

        <div className="mt-8 space-y-6">
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
    </main>
  );
}
