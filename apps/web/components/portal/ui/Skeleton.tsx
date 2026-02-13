"use client";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/**
 * Premium skeleton:
 * - NO hard borders
 * - warm shimmer
 * - looks like a luxury placeholder, not a grey prison
 */
export function SkeletonLine(props: { w?: "sm" | "md" | "lg" | "full"; className?: string }) {
  const w =
    props.w === "sm" ? "w-24" : props.w === "md" ? "w-40" : props.w === "lg" ? "w-64" : "w-full";

  return (
    <div
      className={cn(
        "h-3 rounded-full",
        "bg-[linear-gradient(90deg,rgba(231,221,207,0.55),rgba(255,255,255,0.75),rgba(231,221,207,0.55))]",
        "bg-[length:220%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]",
        w,
        props.className
      )}
    />
  );
}

export function SkeletonBlock(props: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        "bg-[linear-gradient(90deg,rgba(231,221,207,0.55),rgba(255,255,255,0.75),rgba(231,221,207,0.55))]",
        "bg-[length:220%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]",
        props.className
      )}
    />
  );
}

export function SkeletonTable(props: { rows?: number }) {
  const rows = props.rows ?? 8;

  return (
    <div className="overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.78)] shadow-[0_18px_56px_rgba(11,15,25,0.10)]">
      <div className="px-6 py-4">
        <SkeletonLine w="md" />
        <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,rgba(198,169,109,0.35),rgba(11,15,25,0.0))]" />
      </div>

      <div className="px-5 pb-6">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white/72 p-4 shadow-[0_14px_40px_rgba(11,15,25,0.08)]"
            >
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-4">
                  <SkeletonLine w="lg" />
                </div>
                <div className="col-span-3">
                  <SkeletonLine w="md" />
                </div>
                <div className="col-span-3">
                  <SkeletonLine w="md" />
                </div>
                <div className="col-span-2">
                  <SkeletonLine w="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* keyframes (Tailwind v4 ok via arbitrary animation name) */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 220% 0%;
          }
        }
      `}</style>
    </div>
  );
}
