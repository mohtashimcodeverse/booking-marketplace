import type { ReactNode } from "react";
import Preloader from "@/components/tourm/Preloader";
import FloatingHeader from "@/components/site/FloatingHeader";
import Footer from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* anchor for footer "Back to top" */}
      <div id="top" />
      <Preloader />
      <FloatingHeader />
      {/* kill ANY accidental horizontal overflow */}
      <main className="pt-[76px] sm:pt-[80px] overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
