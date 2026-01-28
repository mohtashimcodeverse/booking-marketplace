export default function LuxSectionDivider({
  from = "#0F1720",
  to = "#FFFFFF",
}: {
  from?: string;
  to?: string;
}) {
  return (
    <div aria-hidden className="relative h-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${from} 0%, rgba(255,255,255,0) 55%, ${to} 100%)`,
        }}
      />
      <div className="absolute left-1/2 top-6 h-16 w-[620px] -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 w-[min(760px,92%)] -translate-x-1/2 -translate-y-1/2">
        <div className="h-px bg-black/10" />
        <div className="mx-auto mt-3 h-px w-[72%] bg-black/5" />
      </div>
    </div>
  );
}
