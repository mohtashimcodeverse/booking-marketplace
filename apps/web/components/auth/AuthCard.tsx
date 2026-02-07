import Link from "next/link";
import type { ReactNode } from "react";
import { AuthSkylineScene } from "@/components/auth/scene/AuthSkylineScene";

type Width = "sm" | "md" | "lg" | "xl";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;

  eyebrow?: string;
  showBackHome?: boolean;
  width?: Width;
  footnote?: ReactNode;
}

function widthClass(w: Width): string {
  switch (w) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    default:
      return "max-w-md";
  }
}

export function AuthCard({
  title,
  subtitle,
  children,
  eyebrow,
  showBackHome,
  width = "md",
  footnote,
}: AuthCardProps) {
  return (
    <main className="relative min-h-screen bg-[color:var(--tourm-bg)]">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <AuthSkylineScene />
      </div>

      {/* MUCH lighter readability overlay (so background stays vivid) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.60),rgba(255,255,255,0.22)_55%,rgba(255,255,255,0.30)_100%)]" />

      {/* Centered content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className={`w-full ${widthClass(width)}`}>
          <div className="relative">
            {/* Accent cards (kept subtle, not dull) */}
            <div className="pointer-events-none absolute -left-10 -top-10 hidden h-24 w-32 rotate-[-6deg] rounded-2xl bg-white/75 shadow-[0_24px_70px_rgba(2,10,20,0.10)] ring-1 ring-black/5 backdrop-blur-xl lg:block">
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(22,166,200,0.38),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(11,34,48,0.14),transparent_60%),linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.45))]" />
              </div>
            </div>

            <div className="pointer-events-none absolute -right-8 -bottom-10 hidden h-24 w-32 rotate-[7deg] rounded-2xl bg-white/75 shadow-[0_24px_70px_rgba(2,10,20,0.10)] ring-1 ring-black/5 backdrop-blur-xl lg:block">
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <div className="h-full w-full bg-[radial-gradient(circle_at_60%_35%,rgba(22,166,200,0.34),transparent_60%),radial-gradient(circle_at_35%_65%,rgba(11,34,48,0.12),transparent_60%),linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.42))]" />
              </div>
            </div>

            {/* Form card */}
            <div className="rounded-3xl bg-white/82 p-6 ring-1 ring-black/10 shadow-[0_28px_90px_rgba(2,10,20,0.14)] backdrop-blur-2xl sm:p-8">
              <header className="mb-6">
                {eyebrow ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[color:var(--tourm-ink)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--tourm-primary)]" />
                    {eyebrow}
                  </div>
                ) : null}

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--tourm-ink)] sm:text-3xl">
                  {title}
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-[color:var(--tourm-muted)]">
                  {subtitle}
                </p>

                {showBackHome ? (
                  <div className="mt-3 text-xs text-[color:var(--tourm-muted)]">
                    <Link href="/" className="font-semibold text-[color:var(--tourm-ink)] hover:underline">
                      Back to home
                    </Link>
                  </div>
                ) : null}
              </header>

              {children}
            </div>

            {footnote ? <div className="mt-4">{footnote}</div> : null}

            <div className="mt-4 text-center text-[11px] leading-relaxed text-[color:var(--tourm-muted)]">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="font-semibold text-[color:var(--tourm-ink)] hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[color:var(--tourm-ink)] hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
