import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CancellationActor,
  CancellationMode,
  CancellationPolicyConfig,
  PenaltyType,
} from '@prisma/client';

export type CancellationTier = 'FREE' | 'PARTIAL' | 'NO_REFUND';

export type CancellationPolicyDecision = {
  tier: CancellationTier;
  mode: CancellationMode;
  policyVersion: string;
  releasesInventory: boolean;

  penaltyAmount: number;
  refundableAmount: number;

  // optional “informational” values for logs/debug
  hoursToCheckIn: number;
};

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function hoursDiff(a: Date, b: Date) {
  // returns hours between a and b (b - a) in hours
  const ms = b.getTime() - a.getTime();
  return ms / (1000 * 60 * 60);
}

function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = checkOut.getTime() - checkIn.getTime();
  const nights = ms / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(nights));
}

@Injectable()
export class CancellationPolicyService {
  /**
   * Strict Frank Porter style:
   * - Tiered windows (free / partial / no-refund)
   * - Penalty model configurable (percent total, percent nights, fixed fee)
   * - Optional “charge first night” behavior (approx, since we don’t store nightly breakdown yet)
   * - Soft vs hard cancel supported
   */
  decide(params: {
    now: Date;
    actor: CancellationActor;
    booking: { checkIn: Date; checkOut: Date; totalAmount: number; currency: string };
    policy: CancellationPolicyConfig;
    requestedMode?: CancellationMode;
  }): CancellationPolicyDecision {
    const { now, booking, policy, requestedMode } = params;

    const hoursToCheckIn = hoursDiff(now, booking.checkIn);

    // If check-in already started/passed, our V1 strict rule: no cancellations by default.
    // Admin overrides can still be allowed at service layer if desired.
    if (hoursToCheckIn < 0) {
      throw new BadRequestException('Cancellation is not allowed after check-in time.');
    }

    const freeH = policy.freeCancelBeforeHours ?? 0;
    const partialH = policy.partialRefundBeforeHours ?? 0;
    const noRefundH = policy.noRefundWithinHours ?? 0;

    // sanity
    const safeFree = Math.max(0, freeH);
    const safePartial = Math.max(0, partialH);
    const safeNoRefund = Math.max(0, noRefundH);

    // Determine tier
    let tier: CancellationTier;
    if (hoursToCheckIn >= safeFree) tier = 'FREE';
    else if (hoursToCheckIn >= safePartial) tier = 'PARTIAL';
    else if (hoursToCheckIn >= safeNoRefund) tier = 'NO_REFUND';
    else tier = 'NO_REFUND';

    const total = Math.max(0, booking.totalAmount);

    const mode =
      requestedMode ??
      (policy.defaultMode ?? CancellationMode.SOFT);

    // Releases inventory:
    // - HARD always releases
    // - SOFT generally releases too (we keep this true for V1; ops layer can evolve later)
    const releasesInventory = true;

    // Compute penalty based on tier + policy
    let penaltyAmount = 0;

    if (tier === 'FREE') {
      penaltyAmount = 0;
    } else if (tier === 'PARTIAL') {
      penaltyAmount = this.computePenalty(total, booking.checkIn, booking.checkOut, policy);
    } else {
      // NO_REFUND: strict
      // Either take full amount, OR policy-defined penalty if it implies full capture.
      // For strict FP, default is full penalty => refundable 0.
      penaltyAmount = total;

      // Optional: charge first night behavior (approximation)
      if (policy.chargeFirstNightOnLateCancel) {
        const nights = nightsBetween(booking.checkIn, booking.checkOut);
        const approxNight = Math.floor(total / nights);
        penaltyAmount = clampInt(approxNight, 0, total);
      }
    }

    penaltyAmount = clampInt(penaltyAmount, 0, total);
    const refundableAmount = clampInt(total - penaltyAmount, 0, total);

    return {
      tier,
      mode,
      policyVersion: policy.version,
      releasesInventory,
      penaltyAmount,
      refundableAmount,
      hoursToCheckIn: Math.floor(hoursToCheckIn),
    };
  }

  private computePenalty(
    totalAmount: number,
    checkIn: Date,
    checkOut: Date,
    policy: CancellationPolicyConfig,
  ): number {
    const type = policy.penaltyType ?? PenaltyType.PERCENT_OF_TOTAL;
    const value = policy.penaltyValue ?? 0;

    if (type === PenaltyType.NONE) return 0;

    if (type === PenaltyType.FIXED_FEE) {
      return clampInt(value, 0, totalAmount);
    }

    if (type === PenaltyType.PERCENT_OF_TOTAL) {
      const pct = clampInt(value, 0, 100);
      return clampInt(Math.round((pct / 100) * totalAmount), 0, totalAmount);
    }

    if (type === PenaltyType.PERCENT_OF_NIGHTS) {
      // Approximation: we don’t store nightly pricing yet.
      // Use total/nights and apply percent to a single “nightly bucket”.
      const nights = nightsBetween(checkIn, checkOut);
      const approxNight = Math.floor(totalAmount / nights);
      const pct = clampInt(value, 0, 100);
      const penalty = Math.round((pct / 100) * (approxNight * nights));
      return clampInt(penalty, 0, totalAmount);
    }

    return 0;
  }
}
