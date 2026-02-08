export type PortalCalendarEvent =
  | {
      type: "BOOKING";
      id: string;
      bookingRef: string;
      propertyId: string;
      propertyTitle: string;
      start: string;
      end: string;
      status: string;
      guestName: string | null;
      guestDisplay: string | null;
      currency: string | null;
      totalAmount: number | null;
      note: null;
    }
  | {
      type: "HOLD";
      id: string;
      bookingRef: null;
      propertyId: string;
      propertyTitle: string;
      start: string;
      end: string;
      status: string;
      guestName: null;
      guestDisplay: string | null;
      currency: null;
      totalAmount: null;
      note: string | null;
      expiresAt: string;
    }
  | {
      type: "BLOCKED";
      id: string;
      bookingRef: null;
      propertyId: string;
      propertyTitle: string;
      start: string;
      end: string;
      status: "BLOCKED";
      guestName: null;
      guestDisplay: string | null;
      currency: null;
      totalAmount: null;
      note: string | null;
    };

export type PortalCalendarProperty = {
  id: string;
  title: string;
  city: string | null;
  status: string;
};

export type PortalCalendarResponse = {
  from: string;
  to: string;
  selectedPropertyId: string | null;
  properties: PortalCalendarProperty[];
  events: PortalCalendarEvent[];
};
