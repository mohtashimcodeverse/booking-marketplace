export function ensureGsap() {
  if (typeof window === "undefined") {
    // In SSR, return a lightweight placeholder to avoid runtime crashes
    return null as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gsap = require("gsap").default ?? require("gsap");

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ScrollTrigger = require("gsap/ScrollTrigger").ScrollTrigger;
    if (ScrollTrigger && !gsap.core.globals().ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
  } catch {
    // If ScrollTrigger isn't available for some reason, fail gracefully.
  }

  return gsap;
}
  