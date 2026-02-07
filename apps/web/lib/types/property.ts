import type { CurrencyCode } from "./search";

export type MediaCategory =
  | "COVER"
  | "BEDROOM"
  | "LIVING_ROOM"
  | "KITCHEN"
  | "BATHROOM"
  | "DINING"
  | "BALCONY"
  | "AMENITIES"
  | "BUILDING"
  | "VIEW"
  | "OTHER";

export type PropertyMedia = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  category: MediaCategory;
};

export type PropertyAmenity =
  | "WIFI"
  | "POOL"
  | "GYM"
  | "PARKING"
  | "ELEVATOR"
  | "AIR_CONDITIONING"
  | "KITCHEN"
  | "WASHER"
  | "TV"
  | "WORKSPACE"
  | "SEA_VIEW"
  | "CITY_VIEW"
  | "PET_FRIENDLY"
  | "SMOKE_FREE";

export type HouseRuleKey =
  | "NO_PARTIES"
  | "NO_SMOKING"
  | "NO_PETS"
  | "QUIET_HOURS"
  | "ID_REQUIRED"
  | "CHECKIN_RULES"
  | "CHECKOUT_RULES";

export type HouseRule = {
  key: HouseRuleKey;
  title: string;
  description: string;
};

export type PropertyDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;

  description: string | null;

  city: string | null;
  area: string | null;
  addressLine1: string | null;

  lat: number | null;
  lng: number | null;

  currency: CurrencyCode;
  priceFrom: number;

  maxGuests: number;
  bedrooms: number | null;
  bathrooms: number | null;

  amenities: PropertyAmenity[];
  houseRules: HouseRule[];

  media: PropertyMedia[];
};

export type QuoteBreakdown = {
  nights: number;
  currency: CurrencyCode;
  baseAmount: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
};

export type QuoteResponse = {
  ok: true;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  breakdown: QuoteBreakdown;
};

/**
 * Authoritative backend shape (from your curl):
 * POST /api/properties/:propertyId/reserve
 * {
 *   ok: true,
 *   canReserve: true,
 *   hold: { id, propertyId, checkIn, checkOut, expiresAt, status },
 *   quote: { ... breakdown ... }
 * }
 */
export type HoldStatus = "ACTIVE" | "CONVERTED" | "EXPIRED" | "CANCELLED";

export type ReserveHold = {
  id: string;
  propertyId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  expiresAt: string; // ISO
  status: HoldStatus;
};

export type ReserveQuote = {
  ok: boolean;
  canBook: boolean;
  reasons: string[];
  propertyId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  minNightsRequired: number;
  currency: CurrencyCode;
  breakdown: {
    basePricePerNight: number;
    nightlySubtotal: number;
    cleaningFee: number;
    total: number;
  };
};

export type ReserveResponse = {
  ok: true;
  canReserve: boolean;
  hold: ReserveHold;
  quote: ReserveQuote;
};

/**
 * Authoritative backend shape (from your curl):
 * POST /api/bookings
 * {
 *   ok: true,
 *   reused: false,
 *   booking: { id, status, totalAmount, currency, expiresAt, ... }
 * }
 */
export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";

export type CreateBookingResponse = {
  ok: true;
  reused: boolean;
  booking: {
    id: string;
    customerId: string;
    propertyId: string;
    holdId: string;
    checkIn: string; // ISO
    checkOut: string; // ISO
    adults: number;
    children: number;
    status: BookingStatus;
    totalAmount: number;
    currency: CurrencyCode;
    idempotencyKey: string | null;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    cancelledAt: string | null;
    cancelledBy: string | null;
    cancellationReason: string | null;
  };
};
