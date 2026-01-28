"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");

  const canSearch = useMemo(() => Boolean(checkIn && checkOut), [checkIn, checkOut]);

  return (
    <div className="lux-container -mt-10 md:-mt-14">
      <div className="rounded-4xl border border-black/10 bg-white shadow-card">
        <div className="px-6 py-7 md:px-10">
          <div className="font-heading text-2xl md:text-3xl text-ink">Find The Best Place</div>

          <div className="mt-6 grid gap-4 md:grid-cols-5 md:items-end">
            <div>
              <label className="text-xs text-gray-500">Check In</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lux-olive"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Check Out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lux-olive"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Adults</label>
              <select
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lux-olive"
              >
                {["1","2","3","4","5","6"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Children</label>
              <select
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lux-olive"
              >
                {["0","1","2","3","4"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <button
              disabled={!canSearch}
              onClick={() => {
                const params = new URLSearchParams({
                  checkIn,
                  checkOut,
                  adults,
                  children,
                });
                router.push(`/properties?${params.toString()}`);
              }}
              className={`rounded-2xl px-6 py-3 text-sm font-medium text-white transition ${
                canSearch ? "bg-lux-olive hover:bg-lux-olive2" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Check Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
