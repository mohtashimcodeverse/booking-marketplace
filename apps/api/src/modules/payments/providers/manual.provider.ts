import { Injectable } from '@nestjs/common';

@Injectable()
export class ManualPaymentsProvider {
  async authorize(params: { bookingId: string; amount: number; currency: string }) {
    return {
      providerRef: `manual_auth_${params.bookingId}_${Date.now()}`,
    };
  }

  async capture(params: { providerRef: string }) {
    return {
      providerRef: `manual_cap_${params.providerRef}_${Date.now()}`,
    };
  }

  async refund(params: {
    providerRef?: string | null;
    refundId: string;
    amount: number;
    currency: string;
  }) {
    return {
      providerRefundRef: `manual_ref_${params.refundId}_${Date.now()}`,
    };
  }
}
