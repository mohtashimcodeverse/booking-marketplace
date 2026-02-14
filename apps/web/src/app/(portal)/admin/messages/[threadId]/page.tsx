"use client";

import { useParams } from "next/navigation";
import PortalMessagesView from "@/components/portal/messages/PortalMessagesView";
import {
  getAdminMessageThread,
  listAdminMessageThreads,
  sendAdminMessage,
} from "@/lib/api/portal/messaging";

export default function AdminMessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = typeof params?.threadId === "string" ? params.threadId : null;

  return (
    <PortalMessagesView
      role="admin"
      title="Messages"
      subtitle="Portal Home / Messages / Thread"
      listThreads={listAdminMessageThreads}
      getThread={getAdminMessageThread}
      sendMessage={sendAdminMessage}
      selectedThreadId={threadId}
      threadHref={(id) => `/admin/messages/${encodeURIComponent(id)}`}
    />
  );
}
