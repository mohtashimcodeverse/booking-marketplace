import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Gilda_Display, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "./providers";


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
  title: "NovaStay — Premium stays. Seamless booking.",
  description: "High-performance booking experience with modern UI and fast search.",
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
