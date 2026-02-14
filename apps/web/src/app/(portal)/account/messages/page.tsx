"use client";

import PortalMessagesView from "@/components/portal/messages/PortalMessagesView";
import {
  createUserMessageThread,
  getUserMessageThread,
  listUserMessageThreads,
  sendUserMessage,
} from "@/lib/api/portal/messaging";

export default function AccountMessagesPage() {
  return (
    <PortalMessagesView
      role="customer"
      title="Messages"
      subtitle="Contact admin support for booking and stay questions"
      listThreads={listUserMessageThreads}
      getThread={getUserMessageThread}
      sendMessage={sendUserMessage}
      createThread={createUserMessageThread}
      threadHref={(threadId) => `/account/messages/${encodeURIComponent(threadId)}`}
    />
  );
}
