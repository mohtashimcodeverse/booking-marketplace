"use client";

import PortalMessagesView from "@/components/portal/messages/PortalMessagesView";
import {
  createVendorMessageThread,
  getVendorMessageThread,
  listVendorMessageThreads,
  sendVendorMessage,
} from "@/lib/api/portal/messaging";

export default function VendorMessagesPage() {
  return (
    <PortalMessagesView
      role="vendor"
      title="Messages"
      subtitle="Chat with admin about listings, bookings, and operations"
      listThreads={listVendorMessageThreads}
      getThread={getVendorMessageThread}
      sendMessage={sendVendorMessage}
      createThread={createVendorMessageThread}
      threadHref={(threadId) => `/vendor/messages/${encodeURIComponent(threadId)}`}
    />
  );
}
