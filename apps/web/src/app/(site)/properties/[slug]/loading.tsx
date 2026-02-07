export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="h-8 w-[420px] max-w-full rounded-xl bg-slate-200/70" />
        <div className="mt-3 h-4 w-[520px] max-w-full rounded-xl bg-slate-200/60" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="aspect-[16/10] w-full rounded-2xl bg-slate-200/60" />
            <div className="mt-6 grid gap-3">
              <div className="h-3 w-full rounded bg-slate-200/50" />
              <div className="h-3 w-11/12 rounded bg-slate-200/50" />
              <div className="h-3 w-10/12 rounded bg-slate-200/50" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-6 w-2/3 rounded bg-slate-200/70" />
            <div className="mt-3 h-10 w-full rounded bg-slate-200/60" />
            <div className="mt-3 h-10 w-full rounded bg-slate-200/60" />
            <div className="mt-3 h-10 w-full rounded bg-slate-200/60" />
            <div className="mt-5 h-11 w-full rounded-xl bg-slate-200/70" />
          </div>
        </div>
      </div>
    </main>
  );
}
