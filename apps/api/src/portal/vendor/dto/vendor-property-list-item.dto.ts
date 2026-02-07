import { PropertyStatus } from '@prisma/client';

export type VendorPropertyListItemDto = {
  id: string;
  title: string;
  city: string | null;
  status: PropertyStatus;

  // Portal "price from" (schema-aligned)
  priceFrom: number;

  bookingsCount: number;
  createdAt: string;
};
