"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalAvailabilityCalendar } from "@/components/portal/calendar/PortalAvailabilityCalendar";
import { getAdminCalendar } from "@/lib/api/portal/admin";

export default function AdminCalendarPage() {
  return (
    <PortalShell
      role="admin"
      title="Calendar"
      subtitle="Inspect booking blocks and operational availability by property"
    >
      <PortalAvailabilityCalendar
        role="admin"
        loadData={async ({ from, to, propertyId }) =>
          getAdminCalendar({ from, to, propertyId })
        }
      />
    </PortalShell>
  );
}
