import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

function cleanBaseUrl(raw?: string): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  return v.endsWith('/') ? v.slice(0, -1) : v;
}

function extractBookingId(query: Record<string, unknown>): string | null {
  const candidates = ['bookingId', 'cartid', 'ivp_cart', 'cart_id'];
  for (const key of candidates) {
    const value = query[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

@Controller('payments')
export class PaymentsReturnsController {
  private resolveFrontendBaseUrl(): string | null {
    return (
      cleanBaseUrl(process.env.PUBLIC_WEB_BASE_URL) ??
      cleanBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
      cleanBaseUrl(process.env.FRONTEND_BASE_URL) ??
      cleanBaseUrl(process.env.WEB_BASE_URL)
    );
  }

  private redirectToPaymentResult(
    res: Response,
    path: '/payment/success' | '/payment/cancelled',
    bookingId: string | null,
    fallbackPayload: Record<string, unknown>,
  ) {
    const frontendBase = this.resolveFrontendBaseUrl();
    if (!frontendBase) {
      res.status(200).json(fallbackPayload);
      return;
    }

    const target = new URL(path, `${frontendBase}/`);
    if (bookingId) target.searchParams.set('bookingId', bookingId);
    res.redirect(302, target.toString());
  }

  @Get('return/telr')
  telrReturn(@Query() query: Record<string, unknown>, @Res() res: Response) {
    const bookingId = extractBookingId(query);
    this.redirectToPaymentResult(res, '/payment/success', bookingId, {
      ok: true,
      provider: 'TELR',
      state: 'RETURN',
      bookingId,
      query,
    });
  }

  @Get('cancel/telr')
  telrCancel(@Query() query: Record<string, unknown>, @Res() res: Response) {
    const bookingId = extractBookingId(query);
    this.redirectToPaymentResult(res, '/payment/cancelled', bookingId, {
      ok: true,
      provider: 'TELR',
      state: 'CANCEL',
      bookingId,
      query,
    });
  }
}
