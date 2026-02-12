export const SUPPORTED_CURRENCIES = ["AED", "USD", "EUR", "GBP"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export type FxRates = {
  USD: number | null;
  EUR: number | null;
  GBP: number | null;
};

export const DEFAULT_CURRENCY: SupportedCurrency = "AED";
export const CURRENCY_STORAGE_KEY = "ll_currency_v1";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function parseSupportedCurrency(value: unknown): SupportedCurrency {
  if (typeof value !== "string") return DEFAULT_CURRENCY;
  const normalized = value.trim().toUpperCase();
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(normalized)
    ? (normalized as SupportedCurrency)
    : DEFAULT_CURRENCY;
}

export function fallbackFxRates(): FxRates {
  return {
    USD: null,
    EUR: null,
    GBP: null,
  };
}

export function convertAedTo(
  amountAed: number,
  currency: SupportedCurrency,
  rates: FxRates
): number | null {
  if (!isFiniteNumber(amountAed)) return null;
  if (currency === "AED") return amountAed;
  const rate = rates[currency];
  if (!isFiniteNumber(rate) || rate <= 0) return null;
  return amountAed * rate;
}

export function formatCurrencyAmount(
  amount: number | null,
  currency: SupportedCurrency,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  if (!isFiniteNumber(amount)) return `${currency} --`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: options?.maximumFractionDigits ?? (currency === "AED" ? 0 : 2),
      minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
