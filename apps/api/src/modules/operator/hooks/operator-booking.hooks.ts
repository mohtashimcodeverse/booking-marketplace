import { Booking, PropertyServiceConfig, ServicePlan } from '@prisma/client';

export type BookingConfirmedHookInput = {
  booking: Booking;
  serviceConfig: PropertyServiceConfig | null;
  servicePlan: ServicePlan | null;
};

export type BookingCancelledHookInput = {
  booking: Booking;
};

export interface OperatorBookingHooks {
  onBookingConfirmed(input: BookingConfirmedHookInput): Promise<void>;
  onBookingCancelled(input: BookingCancelledHookInput): Promise<void>;
}
