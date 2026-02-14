"use client";

import { useParams } from "next/navigation";
import PortalMessagesView from "@/components/portal/messages/PortalMessagesView";
import {
  createUserMessageThread,
  getUserMessageThread,
  listUserMessageThreads,
  sendUserMessage,
} from "@/lib/api/portal/messaging";

export default function AccountMessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = typeof params?.threadId === "string" ? params.threadId : null;

  return (
    <PortalMessagesView
      role="customer"
      title="Messages"
      subtitle="Portal Home / Messages / Thread"
      listThreads={listUserMessageThreads}
      getThread={getUserMessageThread}
      sendMessage={sendUserMessage}
      createThread={createUserMessageThread}
      selectedThreadId={threadId}
      threadHref={(id) => `/account/messages/${encodeURIComponent(id)}`}
    />
  );
}
