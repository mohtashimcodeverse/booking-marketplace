type Service = {
  title: string;
  desc: string;
  bullets: ReadonlyArray<string>;
};

function ServiceCard({ s }: { s: Service }) {
  return (
    <div className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-primary">{s.title}</p>
        <div className="card-icon-plate h-10 w-10" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-secondary">{s.desc}</p>

      <ul className="mt-5 space-y-2">
        {s.bullets.slice(0, 5).map((b) => (
          <li key={b} className="flex gap-3 text-sm text-secondary">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand/70" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServiceGrid() {
  const services: Service[] = [
    {
      title: "Cleaning",
      desc: "Consistent turnover cleaning designed for short stays — aligned with booking operations.",
      bullets: ["Booking-driven scheduling", "Turnover readiness checks", "Photo/notes support (future)", "Escalation path for issues"],
    },
    {
      title: "Inspection",
      desc: "Quality control so the stay matches what guests expect — fewer disputes, better reviews.",
      bullets: ["Pre-check-in inspection", "Post-checkout walkthrough", "Checklist-driven process", "Issue flags for maintenance"],
    },
    {
      title: "Linen",
      desc: "Linen workflows that keep standards consistent across multiple properties and turnovers.",
      bullets: ["Linen change scheduling", "Inventory-aware workflow (future)", "Turnover coordination", "Operator-managed standards"],
    },
    {
      title: "Restock",
      desc: "Restocking essentials and amenities — built to reduce last-minute guest friction.",
      bullets: ["Amenity restock tasks", "Per-property config (future)", "Turnover-based checks", "Operator-managed SOP"],
    },
    {
      title: "Maintenance",
      desc: "Structured maintenance requests and work orders — tracked, auditable, and lifecycle-driven.",
      bullets: ["Maintenance requests", "Work orders lifecycle", "Assignment & status tracking", "Audit history by design"],
    },
    {
      title: "Guest support",
      desc: "Support isn’t only chat — it’s operational. Issues route into the right workflows.",
      bullets: ["Booking-context support", "Ops escalation when needed", "Policy-driven decisions", "Operator-grade reliability"],
    },
  ];

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">What we do</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Services that make stays reliable
          </h2>
          <p className="mt-2 text-sm text-secondary sm:text-base">
            These are operational capabilities we’re building into the product — aligned with booking states and audited backend workflows.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.title} s={s} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-accent-soft/80 blur-3xl" />
      </div>
    </section>
  );
}
