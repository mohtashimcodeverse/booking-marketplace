export default function Loading() {
  return (
    <main className="min-h-screen bg-dark-1">
      <section className="border-b border-inverted/10">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="h-4 w-24 rounded-xl bg-surface/10" />
          <div className="mt-3 h-9 w-72 rounded-xl bg-surface/10" />
          <div className="mt-3 h-4 w-[520px] max-w-full rounded-xl bg-surface/10" />
          <div className="mt-6 h-[82px] w-full rounded-2xl bg-surface/10" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="h-[260px] rounded-2xl border border-inverted/10 bg-surface/[0.03]" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-inverted/10 bg-surface/[0.03]">
                  <div className="aspect-[4/3] w-full bg-surface/10" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-2/3 rounded bg-surface/10" />
                    <div className="h-3 w-1/2 rounded bg-surface/10" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-6 w-20 rounded bg-surface/10" />
                      <div className="h-6 w-16 rounded bg-surface/10" />
                      <div className="h-6 w-16 rounded bg-surface/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[620px] rounded-2xl border border-inverted/10 bg-surface/[0.03]" />
        </div>
      </section>
    </main>
  );
}
