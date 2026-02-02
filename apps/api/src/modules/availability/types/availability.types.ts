export type ISODate = string; // "YYYY-MM-DD"

export type AvailabilityDay = {
  date: ISODate;
  status: 'AVAILABLE' | 'BLOCKED';
  effectiveMinNights: number;
  minNightsOverride: number | null;
  note: string | null;
  isHeld: boolean;
};

export type AvailabilityRangeResult = {
  propertyId: string;
  from: ISODate;
  to: ISODate;
  days: AvailabilityDay[];
};
