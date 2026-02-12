import Image from "next/image";

const PARTNER_LOGOS = [
  { src: "/partner_logo/airbnb.svg", alt: "Airbnb" },
  { src: "/partner_logo/booking.svg", alt: "Booking.com" },
  { src: "/partner_logo/vrbo.svg", alt: "Vrbo" },
  { src: "/partner_logo/expedia.svg", alt: "Expedia" },
  { src: "/partner_logo/agoda.svg", alt: "Agoda" },
  { src: "/partner_logo/tripadvisor.svg", alt: "Tripadvisor" },
  { src: "/partner_logo/home_away.svg", alt: "HomeAway" },
];

export default function PartnerDistributionStrip() {
  return (
    <section className="relative w-full py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid min-h-[33vh] overflow-hidden rounded-[2rem] border border-line-strong bg-surface shadow-card md:grid-cols-[1.05fr_1.25fr]">
          <div className="relative min-h-[190px] md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1600&q=82"
              alt="Property listing operations"
              fill
              className="object-cover"
              sizes="(max-width: 767px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink/70 via-ink/18 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/26 bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">One onboarding, multi-channel reach.</p>
              <p className="mt-1 text-xs text-white/84">We syndicate listings to high-intent travel marketplaces.</p>
            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/70">Distribution</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-primary sm:text-2xl">
              We&apos;ll list your property on these sites
            </h3>
            <p className="mt-2 text-sm text-secondary/78">
              Premium channel distribution designed to increase occupancy while keeping availability and pricing in sync.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {PARTNER_LOGOS.map((logo) => (
                <div
                  key={logo.alt}
                  className="group flex h-16 items-center justify-center rounded-2xl border border-line bg-bg px-3 shadow-sm transition hover:border-brand/35 hover:bg-brand-soft-2"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={118}
                    height={36}
                    className="h-8 w-auto object-contain opacity-90 transition group-hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
