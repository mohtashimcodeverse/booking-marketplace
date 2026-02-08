"use client";

import type { SearchResponse } from "@/lib/types/search";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";

type Item = SearchResponse["items"][number];

function formatMoney(currency: string | null | undefined, amount: number | null | undefined) {
  if (amount === null || amount === undefined) return null;
  const cur = currency ?? "AED";
  return `${cur} ${amount.toLocaleString()}`;
}

export default function PinPreviewCard(props: {
  item: Item;
  onClose: () => void;
  onOpen: () => void;
}) {
  const img = props.item.coverImage?.url ?? null;
  const title = props.item.title ?? "Stay";
  const area = props.item.location?.area ?? null;
  const city = props.item.location?.city ?? null;
  const meta = [area, city].filter(Boolean).join(" • ");

  const price = formatMoney(props.item.pricing?.currency ?? null, props.item.pricing?.nightly ?? null);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="line-clamp-1 text-sm font-semibold text-white">{title}</div>
          <div className="mt-0.5 line-clamp-1 text-xs text-white/70">{meta || "Dubai"}</div>
          {price ? (
            <div className="mt-1 text-xs font-semibold text-white/90">
              {price} <span className="font-normal text-white/70">/ night</span>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={props.onClose}
          className="rounded-lg border border-white/10 bg-white/[0.06] p-2 text-white/80 hover:bg-white/[0.10]"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="relative h-16 w-24 flex-none overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          {img ? (
            <Image
              src={img}
              alt={props.item.coverImage?.alt ?? title}
              width={96}
              height={64}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={props.onOpen}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white hover:bg-white/[0.10]"
        >
          Open listing <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
