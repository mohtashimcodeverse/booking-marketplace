import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Gilda_Display, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "./providers";
import { site } from "@/config/site";

const heading = Gilda_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.shortName,
    template: `%s • ${site.shortName}`,
  },
  description:
    "Luxury short-term rental management in Dubai — professionally operated homes for owners and premium stays for guests.",
  metadataBase: new URL(site.websiteUrl),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen bg-white font-body text-ink">
        <Providers>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
</Providers>

      </body>
    </html>
  );
}
