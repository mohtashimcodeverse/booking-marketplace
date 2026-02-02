import { createHash } from 'node:crypto';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function assertIsoDay(value: string, fieldName: string): void {
  if (!ISO_DAY.test(value)) {
    throw new Error(`${fieldName} must be YYYY-MM-DD`);
  }
}

// Returns a Date at UTC midnight for YYYY-MM-DD
export function isoDayToUtcDate(isoDay: string): Date {
  assertIsoDay(isoDay, 'date');
  const [y, m, d] = isoDay.split('-').map((x) => Number(x));
  // Date.UTC month is 0-based
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

// Converts a UTC midnight Date back to YYYY-MM-DD
export function utcDateToIsoDay(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Nights are checkIn..(checkOut-1 day)
export function enumerateNights(checkInUtc: Date, checkOutUtc: Date): Date[] {
  const nights: Date[] = [];
  const start = new Date(checkInUtc.getTime());
  const end = checkOutUtc.getTime();

  if (start.getTime() >= end) return nights;

  for (let t = start.getTime(); t < end; ) {
    nights.push(new Date(t));
    t += 24 * 60 * 60 * 1000;
  }

  // The loop includes checkOut date if checkOut is also midnight; but we want [checkIn, checkOut)
  // Example: checkIn=1st, checkOut=3rd => nights: 1st, 2nd (2 nights)
  nights.pop(); // remove checkOut day itself
  return nights;
}

/**
 * Postgres advisory locks accept bigint.
 * We derive a stable bigint from propertyId by hashing it and taking 8 bytes.
 */
export function advisoryLockKeyForProperty(propertyId: string): bigint {
  const hash = createHash('sha256').update(propertyId).digest();
  // take first 8 bytes as signed bigint
  const hi = BigInt(hash.readUInt32BE(0));
  const lo = BigInt(hash.readUInt32BE(4));
  return (hi << 32n) | lo;
}
