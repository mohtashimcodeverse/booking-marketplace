"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomeOffers() {
  const img =
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80";

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
              Special offer
            </div>
            <h3 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif] md:text-4xl">
              Best offers for premium stays
            </h3>
            <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
              Elegant packages and curated stays — presented in a Luxivo premium style.
            </p>

            <div className="mt-8 grid gap-4">
              <OfferCard
                title="Save 15% on weekly stays"
                desc="Perfect for work trips or extended holidays. Premium cleaning + 24/7 support included."
                price="From AED 690 / night"
              />
              <OfferCard
                title="Family comfort package"
                desc="Extra linens, late check-out (subject to availability), and family-friendly recommendations."
                price="From AED 840 / night"
              />
            </div>

            <div className="mt-8">
              <Link
                href="/properties"
                className="inline-flex items-center rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                View all offers →
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-black/10 bg-white p-4 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
            <div className="relative h-[420px] overflow-hidden rounded-[28px]">
              <Image
                src={img}
                alt="Luxury stay offer"
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute left-5 bottom-5 rounded-3xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur">
                <div className="text-xs text-white/80">Limited time</div>
                <div className="mt-1 text-lg font-semibold">Premium stay deals</div>
                <div className="mt-1 text-xs text-white/75">
                  Curated for high occupancy & better reviews
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

      <button className="mt-5 rounded-2xl border border-black/10 bg-white px-5 py-2 text-sm hover:bg-black/5">
        Book now →
      </button>
    </div>
  );
}
