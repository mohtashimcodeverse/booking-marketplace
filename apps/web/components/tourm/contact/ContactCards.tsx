import Link from "next/link";

type Card = {
  title: string;
  desc: string;
  lines: ReadonlyArray<{ label: string; value: string; href?: string }>;
};

function CardItem({ c }: { c: Card }) {
  return (
    <div className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-primary">{c.title}</p>
          <p className="mt-2 text-sm text-secondary/75">{c.desc}</p>
        </div>
        <div className="card-icon-plate h-11 w-11">
          <div className="h-3 w-3 rounded-full bg-brand/55" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {c.lines.map((l) => (
          <div key={l.label} className="flex flex-col gap-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/60">
              {l.label}
            </p>
            {l.href ? (
              <Link
                href={l.href}
                className="text-sm font-semibold text-primary transition hover:text-brand"
              >
                {l.value}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-primary">{l.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 h-1.5 w-12 rounded-full bg-brand/45" />
    </div>
  );
}

export default function ContactCards() {
  const cards: Card[] = [
    {
      title: "Guest bookings",
      desc: "Help with reservations, dates, and booking questions.",
      lines: [
        {
          label: "Email",
          value: "Booking@rentpropertyuae.com",
          href: "mailto:Booking@rentpropertyuae.com",
        },
        {
          label: "Phone",
          value: "+971502348756",
          href: "tel:+971502348756",
        },
      ],
    },
    {
      title: "Owner onboarding",
      desc: "List your property or explore managed programs.",
      lines: [
        {
          label: "Email",
          value: "Info@rentpropertyuae.com",
          href: "mailto:Info@rentpropertyuae.com",
        },
        {
          label: "Website",
          value: "www.rentpropertyuae.com",
          href: "https://www.rentpropertyuae.com",
        },
      ],
    },
    {
      title: "Company",
      desc: "Official business information for trust and compliance.",
      lines: [
        { label: "Legal name", value: "Laugh & Lodge Vocation Homes Rental LLC" },
        { label: "Country", value: "United Arab Emirates" },
      ],
    },
  ];

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {cards.map((c) => (
            <CardItem key={c.title} c={c} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-accent-soft/80 blur-3xl" />
      </div>
    </section>
  );
}
