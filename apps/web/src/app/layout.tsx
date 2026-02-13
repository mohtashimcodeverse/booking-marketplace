import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { AuthProvider } from "@/lib/auth/auth-context";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rentpropertyuae.com"),
  title: {
    default: "Laugh & Lodge",
    template: "%s • Laugh & Lodge",
  },
  description:
    "Luxury short-term rental management in Dubai — professionally operated homes for owners and premium stays for guests.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Laugh & Lodge",
    title: "Laugh & Lodge",
    description:
      "Luxury short-term rental management in Dubai — professionally operated homes for owners and premium stays for guests.",
    url: "/",
    images: [{ url: "/brand/logo.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laugh & Lodge",
    description:
      "Luxury short-term rental management in Dubai — professionally operated homes for owners and premium stays for guests.",
    images: ["/brand/logo.svg"],
  },
  icons: {
    icon: "/brand/logo.svg",
    shortcut: "/brand/logo.svg",
    apple: "/brand/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
