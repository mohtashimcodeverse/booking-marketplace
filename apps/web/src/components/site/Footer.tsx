import Link from "next/link";

const COMPANY = {
  name: "Laugh & Lodge Vocation Homes Rental LLC",
  email: "Info@rentpropertyuae.com",
  phone: "+971502348756",
  address: "Dubai, UAE",
};

export default function Footer() {
  return (
    <footer className="bg-[#0F1720] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-lg font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              {COMPANY.name}
            </div>
            <p className="mt-3 text-sm text-white/70">
              Luxury stays, professionally managed. Built for owners who want better returns and guests who expect consistent quality.
            </p>

            <div className="mt-6 space-y-2 text-sm text-white/75">
              <div><span className="text-white/55">Email:</span> {COMPANY.email}</div>
              <div><span className="text-white/55">Phone:</span> {COMPANY.phone}</div>
              <div><span className="text-white/55">Address:</span> {COMPANY.address}</div>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-white/60">
              Explore
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link className="hover:text-white/80" href="/properties">Properties</Link></li>
              <li><Link className="hover:text-white/80" href="/services">Services</Link></li>
              <li><Link className="hover:text-white/80" href="/owners">For Owners</Link></li>
              <li><Link className="hover:text-white/80" href="/offers">Offers</Link></li>
              <li><Link className="hover:text-white/80" href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-white/60">
              Company
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link className="hover:text-white/80" href="/about">About</Link></li>
              <li><Link className="hover:text-white/80" href="/gallery">Gallery</Link></li>
              <li><Link className="hover:text-white/80" href="/pricing">Pricing</Link></li>
              <li><Link className="hover:text-white/80" href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-white/60">
              Legal
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link className="hover:text-white/80" href="/legal/terms">Terms & Conditions</Link></li>
              <li><Link className="hover:text-white/80" href="/legal/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-white/80" href="/legal/cancellation">Cancellation Policy</Link></li>
              <li><Link className="hover:text-white/80" href="/legal/refund">Refund Policy</Link></li>
            </ul>

            <div className="mt-6 rounded-[22px] border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-medium">Newsletter</div>
              <p className="mt-2 text-xs text-white/65">
                Optional. You can remove this if not needed before launch.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/25"
                  placeholder="Email address"
                />
                <button className="rounded-2xl bg-[#6B7C5C] px-5 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-white/80" href="/legal/terms">Terms</Link>
            <Link className="hover:text-white/80" href="/legal/privacy">Privacy</Link>
            <Link className="hover:text-white/80" href="/legal/cancellation">Cancellation</Link>
            <Link className="hover:text-white/80" href="/legal/refund">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
