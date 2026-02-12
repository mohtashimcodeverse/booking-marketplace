type Card = {
  title: string;
  desc: string;
  bullets: ReadonlyArray<string>;
  emphasis?: boolean;
};

function CardItem({ c }: { c: Card }) {
  const dark = c.emphasis === true;

  return (
    <div
      className={[
        "rounded-2xl p-6",
        dark
          ? "premium-card premium-card-dark"
          : "premium-card premium-card-tinted premium-card-hover card-accent-left",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-primary">{c.title}</p>
          <p className={["mt-2 text-sm", dark ? "text-inverted/78" : "text-secondary/75"].join(" ")}>{c.desc}</p>
        </div>
        {dark ? (
          <span className="rounded-xl border border-brand/30 bg-brand px-3 py-2 text-xs font-extrabold text-accent-text">
            Common
          </span>
        ) : null}
      </div>

      <ul className="mt-6 space-y-2">
        {c.bullets.slice(0, 7).map((b) => (
          <li key={b} className={["flex gap-3 text-sm", dark ? "text-inverted/78" : "text-secondary/80"].join(" ")}>
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingCards() {
  const cards: Card[] = [
    {
      title: "Nightly rate",
      desc: "The base rate per night for the stay. Rates can vary by date and demand.",
      bullets: ["Shown clearly on listing cards", "Used for quote calculation", "May vary by season"],
      emphasis: true,
    },
    {
      title: "Cleaning fee",
      desc: "One-time fee to cover turnover cleaning and preparation.",
      bullets: ["Applied per booking (not per night)", "Supports consistent standards", "Visible in breakdowns"],
    },
    {
      title: "Refunds & penalties",
      desc: "Cancellations follow policy windows. Refunds and penalties are calculated by backend rules.",
      bullets: ["Policy-driven windows", "Audit snapshot kept", "No manual “random math”"],
    },
  ];

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/70 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            Components
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            What makes up the total
          </h2>
          <p className="mt-2 text-sm text-secondary/75 sm:text-base">
            We show a breakdown so you understand exactly what you’re paying for.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
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
