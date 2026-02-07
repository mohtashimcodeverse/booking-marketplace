"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type PreloaderProps = {
  /**
   * Minimum time the preloader stays visible (ms).
   * Keeps the Tourm “premium load” feel even on fast pages.
   */
  minDurationMs?: number;

  /**
   * If true, preloader will not show again for the same tab session.
   */
  oncePerSession?: boolean;
};

type LoaderState = "show" | "hide";

const SESSION_KEY = "ll_preloader_seen_v1";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export default function Preloader(props: PreloaderProps) {
  const minDurationMs = clamp(props.minDurationMs ?? 900, 300, 4000);
  const oncePerSession = props.oncePerSession ?? true;

  const [state, setState] = useState<LoaderState>("show");
  const [progress, setProgress] = useState<number>(0);

  const shouldShow = useMemo(() => {
    if (!oncePerSession) return true;
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  }, [oncePerSession]);

  useEffect(() => {
    if (!shouldShow) {
      setState("hide");
      return;
    }

    const start = performance.now();

    // Simulated “premium” progress: fast at first, slower near end.
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const t = (now - start) / minDurationMs;
      // ease-out curve
      const eased = 1 - Math.pow(1 - clamp(t, 0, 1), 3);
      // keep it under 0.98 until we finish, so exit feels clean
      const p = Math.min(0.98, eased);
      setProgress(p);
      if (t < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    const timeout = window.setTimeout(() => {
      setProgress(1);
      setState("hide");
      if (oncePerSession) sessionStorage.setItem(SESSION_KEY, "1");
    }, minDurationMs);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [minDurationMs, oncePerSession, shouldShow]);

  if (!shouldShow && state === "hide") return null;

  return (
    <AnimatePresence>
      {state === "show" ? (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* background accents (Tourm-ish, subtle) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />
            <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 to-transparent" />
          </div>

          <div className="relative flex w-full max-w-sm flex-col items-center px-6 text-center">
            <motion.div
              className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/brand/logo.svg"
                alt="Laugh & Lodge"
                fill
                className="object-contain p-2"
                priority
              />
            </motion.div>

            <motion.div
              className="mt-4 text-sm font-semibold tracking-wide text-slate-900"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              Laugh & Lodge
            </motion.div>

            <motion.div
              className="mt-1 text-xs text-slate-600"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Preparing your stay experience…
            </motion.div>

            {/* progress bar */}
            <div className="mt-6 w-full">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                <motion.div
                  className="h-full rounded-full bg-slate-900"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.round(progress * 100)}%` }}
                  transition={{ duration: 0.12, ease: "linear" }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Loading</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
            </div>

            {/* subtle “breathing” line */}
            <motion.div
              className="mt-6 h-[2px] w-24 rounded-full bg-slate-900/20"
              animate={{ opacity: [0.25, 0.6, 0.25], scaleX: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
