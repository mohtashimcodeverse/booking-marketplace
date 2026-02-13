"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalAvailabilityCalendar } from "@/components/portal/calendar/PortalAvailabilityCalendar";
import {
  createVendorBlockRequest,
  getVendorCalendar,
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
        blockControlMode="request"
        loadData={async ({ from, to, propertyId }) =>
          getVendorCalendar({ from, to, propertyId })
        }
        onBlockRange={async ({ propertyId, from, to, note }) =>
          createVendorBlockRequest({
            propertyId,
            startDate: from,
            endDate: to,
            reason: note,
          })
        }
      />
    </PortalShell>
  );
}
