"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ensureGsap } from "@/lib/gsap";

export default function PageTransition() {
  const pathname = usePathname();

  useEffect(() => {
    const gsap = ensureGsap();
    // Animate main content in on route change
    gsap.fromTo(
      "main",
      { opacity: 0, y: 10, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, ease: "power3.out" }
    );
  }, [pathname]);

  return null;
}
