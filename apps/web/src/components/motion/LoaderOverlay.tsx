"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND } from "@/components/site/Brand";

export default function LoaderOverlay() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  // initial load
  useEffect(() => {
    const t = window.setTimeout(() => {
      startTransition(() => setShow(false));
    }, 850);

    return () => window.clearTimeout(t);
  }, []);

  // route change loader (safe scheduling)
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      startTransition(() => setShow(true));
    });

    const t = window.setTimeout(() => {
      startTransition(() => setShow(false));
    }, 520);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname]);

  return (
    <div
      className={`fixed inset-0 z-[9999] grid place-items-center bg-lux-bg text-white transition-opacity duration-500 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!show}
    >
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-3xl bg-white/10 backdrop-blur" />
        <div className="mt-4 font-heading text-3xl">{BRAND.name}</div>
        <div className="mt-1 text-xs text-white/70">{BRAND.punchline}</div>

        <div className="mt-6 h-[2px] w-64 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[luxloader_1.1s_ease-in-out_infinite] rounded-full bg-lux-olive" />
        </div>
      </div>

      <style jsx>{`
        @keyframes luxloader {
          0% {
            transform: translateX(-60%);
            opacity: 0.6;
          }
          50% {
            transform: translateX(210%);
            opacity: 1;
          }
          100% {
            transform: translateX(-60%);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
