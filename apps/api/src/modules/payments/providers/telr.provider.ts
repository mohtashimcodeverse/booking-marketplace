import { Injectable } from '@nestjs/common';

export type TelrCreateSessionResult = {
  providerRef: string; // order.ref from Telr
  redirectUrl: string; // hosted payment page URL
};

type TelrGatewayCreateResponse = {
  order?: { ref?: string; url?: string };
  error?: { message?: string; note?: string };
};

type TelrGatewayCheckResponse = {
  order?: {
    ref?: string;
    cartid?: string;
    currency?: string;
    amount?: string;
    status?: { code?: string; text?: string };
    transaction?: { ref?: string; status?: string };
  };
  error?: { message?: string; note?: string };
};

export type TelrVerifiedPayment = {
  ok: true;
  providerRef: string;
  bookingId: string; // our ivp_cart (bookingId)
  statusCode: string;
  statusText: string;
  amountMinor: number; // ✅ normalized to minor units (Int)
  currency: string;
};

@Injectable()
export class TelrPaymentsProvider {
  private get storeId(): string {
    return (process.env.TELR_STORE_ID ?? '').trim();
  }

  private get authKey(): string {
    return (process.env.TELR_AUTH_KEY ?? '').trim();
  }

  private get testMode(): string {
    return (process.env.TELR_TEST_MODE ?? '1').trim();
  }

  /**
   * Comma-separated list of Telr success status codes we accept as "paid/authorised".
   * Default kept conservative.
   */
  private get successCodes(): Set<string> {
    const raw = (process.env.TELR_SUCCESS_CODES ?? '3').trim();
    return new Set(
      raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }

  private assertConfigured() {
    if (!this.storeId) throw new Error('TELR_STORE_ID is not configured.');
    if (!this.authKey) throw new Error('TELR_AUTH_KEY is not configured.');
  }

  private toFormUrlEncoded(body: Record<string, string>): string {
    return Object.entries(body)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }

  private minorToMajorString(minor: number): string {
    // Your system uses Int minor units (e.g., cents/paisa).
    // Telr expects a major-unit decimal string.
    const safe = Number.isFinite(minor) ? minor : 0;
    const major = safe / 100;
    return major.toFixed(2);
  }

  private majorStringToMinor(amountStr: string): number {
    const n = Number.parseFloat((amountStr ?? '').trim());
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.round(n * 100);
  }

  async createHostedPaymentSession(params: {
    bookingId: string;
    amountMinor: number;
    currency: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    customerEmail?: string | null;
    customerName?: string | null;
  }): Promise<TelrCreateSessionResult> {
    this.assertConfigured();

    const endpoint = 'https://secure.telr.com/gateway/order.json';

    const payload: Record<string, string> = {
      ivp_method: 'create',
      ivp_store: this.storeId,
      ivp_authkey: this.authKey,
      ivp_test: this.testMode,

      ivp_cart: params.bookingId,
      ivp_amount: this.minorToMajorString(params.amountMinor),
      ivp_currency: params.currency,
      ivp_desc: params.description,

      return_auth: params.returnUrl,
      return_can: params.cancelUrl,
      return_decl: params.cancelUrl,
    };

    if (params.customerEmail) payload.cust_email = params.customerEmail;
    if (params.customerName) payload.bill_fname = params.customerName;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: this.toFormUrlEncoded(payload),
    });

    const text = await res.text();

    let json: TelrGatewayCreateResponse | null = null;
    try {
      json = JSON.parse(text) as TelrGatewayCreateResponse;
    } catch {
      throw new Error(`Telr returned non-JSON response (HTTP ${res.status}).`);
    }

    if (!res.ok) {
      throw new Error(
        `Telr create session failed (HTTP ${res.status}): ${json?.error?.message ?? 'Unknown error'}`,
      );
    }

    const orderRef = (json.order?.ref ?? '').trim();
    const url = (json.order?.url ?? '').trim();

    if (!orderRef || !url) {
      throw new Error(
        `Telr did not return order.ref or order.url. ${json?.error?.message ?? ''}`.trim(),
      );
    }

    return { providerRef: orderRef, redirectUrl: url };
  }

  /**
   * Verify CAPTURED/PAID by calling Telr "check".
   * We never trust webhook payload alone.
   */
  async verifyCapturedPayment(params: { providerRef: string }): Promise<TelrVerifiedPayment> {
    this.assertConfigured();

    const endpoint = 'https://secure.telr.com/gateway/order.json';

    const payload: Record<string, string> = {
      ivp_method: 'check',
      ivp_store: this.storeId,
      ivp_authkey: this.authKey,
      ivp_test: this.testMode,
      ivp_ref: params.providerRef,
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: this.toFormUrlEncoded(payload),
    });

    const text = await res.text();

    let json: TelrGatewayCheckResponse | null = null;
    try {
      json = JSON.parse(text) as TelrGatewayCheckResponse;
    } catch {
      throw new Error(`Telr check returned non-JSON response (HTTP ${res.status}).`);
    }

    if (!res.ok) {
      throw new Error(
        `Telr check failed (HTTP ${res.status}): ${json?.error?.message ?? 'Unknown error'}`,
      );
    }

    const orderRef = (json.order?.ref ?? '').trim();
    const bookingId = (json.order?.cartid ?? '').trim();
    const currency = (json.order?.currency ?? '').trim();
    const amountStr = (json.order?.amount ?? '').trim();

    const statusCode = (json.order?.status?.code ?? '').trim();
    const statusText = (json.order?.status?.text ?? '').trim();

    if (!orderRef) throw new Error('Telr check: missing order.ref.');
    if (!bookingId) throw new Error('Telr check: missing order.cartid.');
    if (!currency) throw new Error('Telr check: missing order.currency.');
    if (!amountStr) throw new Error('Telr check: missing order.amount.');
    if (!statusCode && !statusText) throw new Error('Telr check: missing order.status.');

    if (orderRef !== params.providerRef) {
      throw new Error('Telr check: order.ref mismatch.');
    }

    if (!this.successCodes.has(statusCode)) {
      throw new Error(
        `Telr check: payment not successful. statusCode="${statusCode}" statusText="${statusText}"`,
      );
    }

    const amountMinor = this.majorStringToMinor(amountStr);
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      throw new Error(`Telr check: invalid amount "${amountStr}".`);
    }

    return {
      ok: true,
      providerRef: orderRef,
      bookingId,
      statusCode: statusCode || 'UNKNOWN',
      statusText: statusText || 'UNKNOWN',
      amountMinor,
      currency,
    };
  }
}
