import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { AuthProvider } from "@/lib/auth/auth-context";

export const metadata: Metadata = {
  title: {
    default: "Laugh & Lodge",
    template: "%s • Laugh & Lodge",
  },
  description:
    "Luxury short-term rental management in Dubai — professionally operated homes for owners and premium stays for guests.",
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
