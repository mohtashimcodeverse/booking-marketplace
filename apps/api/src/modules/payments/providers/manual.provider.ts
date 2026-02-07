import { Injectable } from '@nestjs/common';

@Injectable()
export class ManualPaymentsProvider {
  authorize(params: { bookingId: string; amount: number; currency: string }) {
    return Promise.resolve({
      providerRef: `manual_auth_${params.bookingId}_${Date.now()}`,
    });
  }

  capture(params: { providerRef: string }) {
    return Promise.resolve({
      providerRef: `manual_cap_${params.providerRef}_${Date.now()}`,
    });
  }

  refund(params: {
    providerRef?: string | null;
    refundId: string;
    amount: number;
    currency: string;
  }) {
    return Promise.resolve({
      providerRefundRef: `manual_ref_${params.refundId}_${Date.now()}`,
    });
  }
}
