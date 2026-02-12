"use client";

import PortalMessagesView from "@/components/portal/messages/PortalMessagesView";
import {
  getAdminMessageThread,
  listAdminMessageThreads,
  sendAdminMessage,
} from "@/lib/api/portal/messaging";

export default function AdminMessagesPage() {
  return (
    <PortalMessagesView
      role="admin"
      title="Messages"
      subtitle="Admin inbox for vendor and customer conversations"
      listThreads={listAdminMessageThreads}
      getThread={getAdminMessageThread}
      sendMessage={sendAdminMessage}
    />
  );
}
