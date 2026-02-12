"use client";

import { CurrencyProvider } from "@/lib/currency/CurrencyProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
