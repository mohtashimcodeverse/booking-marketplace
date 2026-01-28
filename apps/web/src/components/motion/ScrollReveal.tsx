"use client";

import { useEffect, useRef } from "react";
import { ensureGsap } from "@/lib/gsap";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** animation preset */
  variant?: "fadeUp" | "fade" | "scale" | "slideLeft" | "slideRight";
  /** delay per item (for staggered children) */
  stagger?: number;
  /** start trigger position */
  start?: string; // e.g. "top 85%"
  /** run only once */
  once?: boolean;
};

export default function ScrollReveal({
  children,
  className,
  variant = "fadeUp",
  stagger = 0.08,
  start = "top 85%",
  once = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gsap = ensureGsap();
    if (!gsap) return;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ScrollTrigger = require("gsap/ScrollTrigger").ScrollTrigger;

    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-sr]");

    const from = (() => {
      switch (variant) {
        case "fade":
          return { opacity: 0 };
        case "scale":
          return { opacity: 0, scale: 0.96, filter: "blur(8px)" };
        case "slideLeft":
          return { opacity: 0, x: -24, filter: "blur(8px)" };
        case "slideRight":
          return { opacity: 0, x: 24, filter: "blur(8px)" };
        case "fadeUp":
        default:
          return { opacity: 0, y: 18, filter: "blur(8px)" };
      }
    })();

    const ctx = gsap.context(() => {
      gsap.set(targets, from);

      gsap.to(targets, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: root,
          start,
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    }, root);

    return () => {
      try {
        ScrollTrigger?.refresh?.();
      } catch {}
      ctx.revert();
    };
  }, [variant, stagger, start, once]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
