import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';

type TelrWebhookBody = Record<string, unknown>;

@ApiTags('payments-webhooks')
@Controller('payments/webhooks')
export class PaymentsWebhooksController {
  constructor(private readonly payments: PaymentsService) {}

  /**
   * TELR:
   * - ACK quickly (avoid webhook retry storms)
   * - NEVER confirm booking from payload alone
   * - We verify against Telr gateway (server-to-server "check") inside PaymentsService
   */
  @Post('telr')
  async telr(
    @Body() body: TelrWebhookBody,
    @Headers() _headers: Record<string, string | string[] | undefined>,
  ) {
    const bookingId =
      (typeof body.cartid === 'string' && body.cartid) ||
      (typeof body.ivp_cart === 'string' && body.ivp_cart) ||
      '';

    const providerRef =
      (typeof body.order_ref === 'string' && body.order_ref) ||
      (typeof body.orderref === 'string' && body.orderref) ||
      (typeof body.ref === 'string' && body.ref) ||
      '';

    // If Telr doesn’t send these, we still ACK, but can’t confirm anything.
    if (!bookingId || !providerRef) return { ok: true };

    const webhookEventId =
      (typeof body.event_id === 'string' && body.event_id) ||
      (typeof body.tran_ref === 'string' && body.tran_ref) ||
      `telr_${providerRef}_${bookingId}`;

    await this.payments.handleTelrWebhookCaptured({
      bookingId,
      providerRef,
      webhookEventId,
    });

    return { ok: true };
  }
}
