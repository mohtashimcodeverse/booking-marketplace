export default function ContactMapEmbed() {
  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-card premium-card-tinted overflow-hidden rounded-[2rem]">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="p-8 sm:p-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/70 shadow-sm backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                Location
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                Operating in Dubai & UAE
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary/75 sm:text-base">
                We host and manage stays across key areas in Dubai and the UAE. For property onboarding,
                share your area and unit details — we’ll confirm coverage and program fit.
              </p>

              <div className="premium-card premium-card-dark rounded-2xl p-6">
                <p className="text-sm font-extrabold text-primary">Fast contact</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/60">
                      Phone
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary">+971502348756</p>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/60">
                      Emails
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      Booking@rentpropertyuae.com • Info@rentpropertyuae.com
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/60">
                      Company
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      Laugh & Lodge Vocation Homes Rental LLC
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-1.5 w-12 rounded-full bg-brand/20" />
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden">
              <iframe
                title="RentPropertyUAE coverage map"
                src="https://www.google.com/maps?q=Dubai%20United%20Arab%20Emirates&output=embed"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute left-4 top-4 rounded-2xl border border-line/70 bg-surface/92 px-4 py-3 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                Dubai-focused operations with UAE-wide owner onboarding support.
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-1/25 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
