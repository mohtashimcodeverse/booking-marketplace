"use client";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function SkeletonLine(props: {
  w?: "sm" | "md" | "lg" | "full";
  className?: string;
}) {
  const w =
    props.w === "sm"
      ? "w-24"
      : props.w === "md"
      ? "w-40"
      : props.w === "lg"
      ? "w-64"
      : "w-full";

  return (
    <div
      className={cn(
        "h-3 rounded-full bg-slate-200/70 animate-pulse",
        w,
        props.className,
      )}
    />
  );
}

export function SkeletonBlock(props: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-slate-200/70 animate-pulse",
        props.className,
      )}
    />
  );
}

export function SkeletonTable(props: { rows?: number }) {
  const rows = props.rows ?? 8;

  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 bg-[#f6f3ec]/40 px-6 py-4">
        <SkeletonLine w="md" />
      </div>

      <div className="divide-y divide-black/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4">
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
  );
}
