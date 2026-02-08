"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalAvailabilityCalendar } from "@/components/portal/calendar/PortalAvailabilityCalendar";
import { getUserCalendar } from "@/lib/api/portal/user";

export default function AccountCalendarPage() {
  return (
    <PortalShell
      role="customer"
      title="Calendar"
      subtitle="Read-only monthly availability to support booking decisions"
    >
      <PortalAvailabilityCalendar
        role="customer"
        loadData={async ({ from, to, propertyId }) =>
          getUserCalendar({ from, to, propertyId })
        }
      />
    </PortalShell>
  );
}
