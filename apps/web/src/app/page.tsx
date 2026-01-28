import HeroLux from "@/components/home/HeroLux";
import HomeSearchFloating from "@/components/home/HomeSearchFloating";
import ImageCarousel from "@/components/ui/ImageCarousel";

export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroLux />
      <HomeSearchFloating />

      {/* FEATURED CAROUSEL */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
              Featured
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-4xl">
              Premium managed homes in Dubai
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
              Luxivo-level aesthetic — built for serious property management + premium guest bookings.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ImageCarousel
            slides={[
              {
                src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80",
                alt: "Modern Dubai apartment",
                tag: "Marina • 2BR",
              },
              {
                src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=80",
                alt: "Premium living space",
                tag: "Downtown • 1BR",
              },
              {
                src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=80",
                alt: "Luxury interior",
                tag: "Business Bay • Studio",
              },
              {
                src: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1800&q=80",
                alt: "Bedroom suite",
                tag: "JBR • 3BR",
              },
            ]}
          />
        </div>
      </section>

      {/* ABOUT (Luxivo-style layered card) */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {/* Left visuals (layered cards like Luxivo) */}
          <div className="relative">
            <div className="rounded-[32px] border border-black/10 bg-[#F7F4EE] p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
              <div className="text-4xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                30+
              </div>
              <div className="mt-1 text-sm text-gray-600">Years of experience</div>

              <div className="mt-6 grid gap-4">
                <div className="h-40 rounded-[26px] bg-black/5" />
                <div className="h-28 rounded-[26px] bg-black/5" />
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 w-[58%] rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_30px_90px_rgba(17,24,39,0.12)]">
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                Professional ops
              </div>
              <div className="mt-2 text-sm font-medium text-[#111827]">
                Pricing, cleaning, support, maintenance — handled end-to-end.
              </div>
              <div className="mt-3 h-2 w-20 rounded-full bg-[#6B7C5C]" />
            </div>
          </div>

          {/* Right copy */}
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
              About our brand
            </div>
            <h3 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-4xl">
              Luxury stays — managed with hotel-grade standards.
            </h3>
            <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
              We focus on premium inventory, fast search, transparent pricing, and a modern booking flow.
              Owners get professional short-term rental management. Guests get consistent quality.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>• Prime locations with stunning views</li>
              <li>• Handpicked stays designed for modern living</li>
              <li>• Support team that actually responds</li>
            </ul>

            <div className="mt-7">
              <a
                href="/about"
                className="inline-flex items-center rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                Discover more →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ROOMS & SUITES (Luxivo cards + images) */}
      <section className="relative overflow-hidden bg-[#0F1720]">
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08)_0%,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.06)_0%,transparent_48%),radial-gradient(circle_at_70%_90%,rgba(107,124,92,0.16)_0%,transparent_48%)]" />
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                Rooms & Suites
              </div>
              <h3 className="mt-2 text-3xl font-semibold text-white [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-4xl">
                Rest in comfort. Select from our suites & rooms.
              </h3>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                Premium presentation now — next step: wire this to your /api/properties inventory.
              </p>
            </div>

            <a
              href="/properties"
              className="hidden rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F] md:inline-flex"
            >
              View all stays →
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {roomCards.map((c) => (
              <div
                key={c.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur transition hover:-translate-y-1"
              >
                <div className="relative overflow-hidden rounded-[22px]">
                  <div className="relative h-40">
                    {/* Use img to avoid next/image remote config issues */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  </div>

                  <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
                    ★ {c.rating}
                  </div>
                </div>

                <div className="mt-4 text-white">
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="mt-1 text-xs text-white/60">{c.meta}</div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <div className="text-xl font-medium">{c.price}</div>
                      <div className="text-xs text-white/60">per night</div>
                    </div>
                    <a
                      className="rounded-2xl bg-[#6B7C5C] px-4 py-2 text-xs font-medium text-white hover:bg-[#5C6E4F]"
                      href="/properties"
                    >
                      View details →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 md:hidden">
            <a
              href="/properties"
              className="inline-flex rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
            >
              View all stays →
            </a>
          </div>
        </div>

        <div className="h-14 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* OFFERS (visible + image) */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
              Special offer
            </div>
            <h3 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-4xl">
              Best offers for premium stays
            </h3>
            <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
              Elegant packages and curated stays — presented in Luxivo premium style.
            </p>

            <div className="mt-8 grid gap-4">
              <OfferCard
                title="Save 15% on weekly stays"
                desc="Ideal for extended stays. Premium cleaning + 24/7 guest support included."
                price="From AED 690 / night"
              />
              <OfferCard
                title="Family comfort package"
                desc="Extra linens + late checkout (subject to availability) + family-friendly support."
                price="From AED 840 / night"
              />
            </div>

            <div className="mt-8">
              <a
                href="/properties"
                className="inline-flex items-center rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                View all offers →
              </a>
            </div>
          </div>

          <div className="rounded-[32px] border border-black/10 bg-white p-4 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
            <div className="relative h-[420px] overflow-hidden rounded-[28px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80"
                alt="Luxury stay offer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute left-5 bottom-5 rounded-3xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur">
                <div className="text-xs text-white/80">Limited time</div>
                <div className="mt-1 text-lg font-semibold">Premium stay deals</div>
                <div className="mt-1 text-xs text-white/75">
                  Curated for higher occupancy & better reviews
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="bg-[#0F1720]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
          <div className="grid gap-6 text-white md:grid-cols-4">
            <Stat num="635+" label="Luxury rooms" />
            <Stat num="85k+" label="Guests" />
            <Stat num="2.3k+" label="Five star ratings" />
            <Stat num="2.8m" label="Served breakfast" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
            Testimonial
          </div>
          <h3 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-4xl">
            What guests think about us
          </h3>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Testimonial />
          <Testimonial highlighted />
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-8 overflow-hidden rounded-[32px] border border-black/10 bg-black/5 p-8 md:grid-cols-2 md:p-12">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
              Contact us
            </div>
            <h3 className="mt-3 text-4xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              We’re here to make your stay unforgettable
            </h3>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              For now this is static UI. Next we’ll wire it to backend (availability + inquiries).
            </p>

            <a
              className="mt-8 inline-flex rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              href="/contact"
            >
              Check availability →
            </a>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                placeholder="Your name"
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                placeholder="Email address"
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                placeholder="Check in"
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                placeholder="Check out"
              />
              <textarea
                className="md:col-span-2 h-28 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                placeholder="Write message"
              />
              <button className="md:col-span-2 rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                Send message →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Data (static for now) */
const roomCards = [
  {
    title: "Signature Suite",
    meta: "250 sqm • 3 bed • 3 bathroom",
    price: "AED 950",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Exclusive Deluxe",
    meta: "190 sqm • 2 bed • 2 bathroom",
    price: "AED 720",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Deluxe Family",
    meta: "220 sqm • 3 bed • 2 bathroom",
    price: "AED 840",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Double Suite",
    meta: "160 sqm • 2 bed • 2 bathroom",
    price: "AED 640",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1600&q=80",
  },
];

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="text-4xl font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif]">
        {num}
      </div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
}

function Testimonial({ highlighted }: { highlighted?: boolean }) {
  return (
    <div
      className={`rounded-[32px] border p-8 ${
        highlighted
          ? "border-[#6B7C5C]/40 bg-[#F7F4EE]"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="text-3xl leading-none text-[#6B7C5C]">“</div>
      <p className="mt-3 text-sm text-gray-700">
        Premium design, smooth booking, and a clean experience — this is the exact direction we’re building.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-black/10" />
        <div>
          <div className="text-sm font-medium text-[#111827]">Brooklyn Simmons</div>
          <div className="text-xs text-gray-500">Guest</div>
        </div>
      </div>
    </div>
  );
}

function OfferCard({
  title,
  desc,
  price,
}: {
  title: string;
  desc: string;
  price: string;
}) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
      <div className="text-lg font-semibold text-[#111827]">{title}</div>
      <div className="mt-2 text-sm text-gray-600">{desc}</div>
      <div className="mt-4 text-sm font-medium text-[#111827]">{price}</div>

      <a
        href="/properties"
        className="mt-5 inline-flex rounded-2xl border border-black/10 bg-white px-5 py-2 text-sm hover:bg-black/5"
      >
        Book now →
      </a>
    </div>
  );
}
