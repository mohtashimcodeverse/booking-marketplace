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
    <main className="relative min-h-screen bg-bg">
      <div className="auth-dark-band pointer-events-none absolute inset-0" />
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.86]">
        <AuthSkylineScene />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(79,70,229,0.12),rgba(248,250,252,0.44)_52%,rgba(248,250,252,0.72)_100%)]" />

      {/* Centered content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className={`w-full ${widthClass(width)}`}>
          <div className="relative">
            {/* Accent cards (kept subtle, not dull) */}
            <div className="pointer-events-none absolute -left-10 -top-10 hidden h-24 w-32 rotate-[-6deg] rounded-2xl bg-surface/78 shadow-[0_24px_70px_rgba(11,15,25,0.10)] ring-1 ring-line/55 backdrop-blur-xl lg:block">
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <div className="h-full w-full bg-[radial-gradient(circle_at_28%_30%,rgba(79,70,229,0.28),transparent_56%),radial-gradient(circle_at_72%_62%,rgba(198,169,109,0.24),transparent_62%),linear-gradient(135deg,rgba(255,255,255,0.90),rgba(255,255,255,0.52))]" />
              </div>
            </div>

            <div className="pointer-events-none absolute -right-8 -bottom-10 hidden h-24 w-32 rotate-[7deg] rounded-2xl bg-surface/78 shadow-[0_24px_70px_rgba(11,15,25,0.10)] ring-1 ring-line/55 backdrop-blur-xl lg:block">
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <div className="h-full w-full bg-[radial-gradient(circle_at_60%_35%,rgba(79,70,229,0.26),transparent_60%),radial-gradient(circle_at_35%_65%,rgba(198,169,109,0.22),transparent_60%),linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.48))]" />
              </div>
            </div>

            {/* Form card */}
            <div className="premium-card rounded-3xl border-line-strong bg-surface p-6 shadow-[0_26px_68px_rgba(11,15,25,0.16)] sm:p-8">
              <header className="mb-6">
                {eyebrow ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-line bg-brand-soft px-3 py-1 text-xs font-semibold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {eyebrow}
                  </div>
                ) : null}

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                  {title}
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  {subtitle}
                </p>

                {showBackHome ? (
                  <div className="mt-3 text-xs text-secondary">
                    <Link href="/" className="font-semibold text-brand hover:underline">
                      Back to home
                    </Link>
                  </div>
                ) : null}
              </header>

              {children}
            </div>

            {footnote ? <div className="mt-4">{footnote}</div> : null}

            <div className="mt-4 text-center text-[11px] leading-relaxed text-secondary">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="font-semibold text-brand hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-brand hover:underline">
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
