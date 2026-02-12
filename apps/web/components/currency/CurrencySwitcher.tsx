"use client";

import { useCurrency } from "@/lib/currency/CurrencyProvider";
import type { SupportedCurrency } from "@/lib/currency/currency";

type Props = {
  compact?: boolean;
};

export default function CurrencySwitcher({ compact = false }: Props) {
  const { currency, setCurrency, asOfDate, isLoadingRates } = useCurrency();

  return (
    <label
      className={[
        "inline-flex items-center gap-2 rounded-2xl border border-line/80 bg-surface px-3 py-2 shadow-sm",
        compact ? "text-xs" : "text-sm",
      ].join(" ")}
    >
      <span className="font-semibold text-muted">Currency</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value as SupportedCurrency)}
        className="bg-transparent font-semibold text-primary outline-none"
        aria-label="Select display currency"
      >
        <option value="AED">AED</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
      {!compact ? (
        <span className="hidden text-[11px] text-muted xl:inline">
          {isLoadingRates ? "FX loading..." : asOfDate ? `FX ${asOfDate}` : "FX unavailable"}
        </span>
      ) : null}
    </label>
  );
}
