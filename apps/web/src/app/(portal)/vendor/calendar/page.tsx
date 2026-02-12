"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalAvailabilityCalendar } from "@/components/portal/calendar/PortalAvailabilityCalendar";
import {
  blockVendorPropertyDates,
  getVendorCalendar,
  unblockVendorPropertyDates,
} from "@/lib/api/portal/vendor";

export default function VendorCalendarPage() {
  return (
    <PortalShell
      role="vendor"
      title="Calendar"
      subtitle="Monthly booking visibility for your listings"
    >
      <PortalAvailabilityCalendar
        role="vendor"
        allowBlockControls
        loadData={async ({ from, to, propertyId }) =>
          getVendorCalendar({ from, to, propertyId })
        }
        onBlockRange={async ({ propertyId, from, to, note }) =>
          blockVendorPropertyDates(propertyId, { from, to, note })
        }
        onUnblockRange={async ({ propertyId, from, to, note }) =>
          unblockVendorPropertyDates(propertyId, { from, to, note })
        }
      />
    </PortalShell>
  );
}
