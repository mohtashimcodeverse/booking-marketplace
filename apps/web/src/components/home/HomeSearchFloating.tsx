"use client";

export default function HomeSearchFloating() {
  return (
    <section className="relative z-30 -mt-16 md:-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.14)] md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                Find The Best Place
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Check availability
              </div>
            </div>

            <button className="rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
              Check Now →
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Field label="Check In">
              <input
                type="date"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
              />
            </Field>

            <Field label="Check Out">
              <input
                type="date"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
              />
            </Field>

            <Field label="Adults">
             <select
  defaultValue="2"
  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
</select>

            </Field>

            <Field label="Children">
              <select
  defaultValue="0"
  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
</select>

            </Field>

            <div className="md:pt-[22px]">
              <button className="w-full rounded-2xl bg-[#0F1720] px-6 py-3 text-sm font-medium text-white hover:bg-black">
                Search →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      {children}
    </div>
  );
}
