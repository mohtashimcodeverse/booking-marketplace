"use client";

import { useParams } from "next/navigation";
import PortalMessagesView from "@/components/portal/messages/PortalMessagesView";
import {
  createVendorMessageThread,
  getVendorMessageThread,
  listVendorMessageThreads,
  sendVendorMessage,
} from "@/lib/api/portal/messaging";

export default function VendorMessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = typeof params?.threadId === "string" ? params.threadId : null;

  return (
    <PortalMessagesView
      role="vendor"
      title="Messages"
      subtitle="Portal Home / Messages / Thread"
      listThreads={listVendorMessageThreads}
      getThread={getVendorMessageThread}
      sendMessage={sendVendorMessage}
      createThread={createVendorMessageThread}
      selectedThreadId={threadId}
      threadHref={(id) => `/vendor/messages/${encodeURIComponent(id)}`}
    />
  );
}
