"use client";

import { useCallback, useState } from "react";
import type { Booking, Quote, ReserveResult } from "./bookingFlow";
import { createBooking, reserveHold, type QuoteInput } from "./bookingFlow";

type FlowState =
  | { kind: "idle" }
  | { kind: "holding" }
  | { kind: "creating-booking" }
  | { kind: "done"; booking: Booking; reserve: ReserveResult }
  | { kind: "error"; message: string };

export function useBookingFlow() {
  const [state, setState] = useState<FlowState>({ kind: "idle" });

  const start = useCallback(
    async (propertyId: string, input: QuoteInput): Promise<{ booking: Booking; reserve: ReserveResult }> => {
      try {
        setState({ kind: "holding" });
        const reserve = await reserveHold(propertyId, input);

        setState({ kind: "creating-booking" });
        const res = await createBooking({ propertyId, holdId: reserve.holdId, guests: input.guests });

        setState({ kind: "done", booking: res.booking, reserve });
        return { booking: res.booking, reserve };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Booking failed";
        setState({ kind: "error", message });
        throw err;
      }
    },
    [],
  );

  const reset = useCallback(() => setState({ kind: "idle" }), []);

  return { state, start, reset };
}

/**
 * Optional: pure helper for showing quote in UI
 */
export function formatQuoteSummary(q: Quote): string {
  return `${q.nights} nights • ${q.totalAmount} ${q.currency}`.trim();
}
