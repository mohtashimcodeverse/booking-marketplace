"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell, type PortalRole } from "@/components/portal/PortalShell";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import type {
  MessageThreadDetail,
  MessageThreadListResponse,
  MessageTopic,
  MessageThreadSummary,
} from "@/lib/api/portal/messaging";

type Props = {
  role: PortalRole;
  title: string;
  subtitle: string;
  listThreads: (params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
    topic?: MessageTopic;
  }) => Promise<MessageThreadListResponse>;
  getThread: (threadId: string) => Promise<MessageThreadDetail>;
  sendMessage: (threadId: string, body: string) => Promise<{ ok: true }>;
  createThread?: (input: { subject?: string; topic?: MessageTopic; body: string }) => Promise<MessageThreadDetail>;
};

type ThreadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; thread: MessageThreadDetail };

const TOPIC_OPTIONS: Array<{ value: MessageTopic; label: string }> = [
  { value: "BOOKING_ISSUE", label: "Booking issue" },
  { value: "CHECKIN_ACCESS", label: "Check-in / access" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "PAYMENT_REFUND", label: "Payment / refund" },
  { value: "OTHER", label: "Other" },
];

function topicLabel(topic: MessageTopic): string {
  const selected = TOPIC_OPTIONS.find((item) => item.value === topic);
  return selected ? selected.label : topic;
}

export default function PortalMessagesView(props: Props) {
  const [threadsState, setThreadsState] = useState<
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; items: MessageThreadSummary[] }
  >({ kind: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [threadState, setThreadState] = useState<ThreadState>({ kind: "idle" });
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [topicFilter, setTopicFilter] = useState<"ALL" | MessageTopic>("ALL");
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState<MessageTopic>("BOOKING_ISSUE");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [replyBody, setReplyBody] = useState("");

  async function loadThreads() {
    setThreadsState({ kind: "loading" });
    try {
      const data = await props.listThreads({
        page: 1,
        pageSize: 40,
        unreadOnly,
        topic: topicFilter === "ALL" ? undefined : topicFilter,
      });
      const items = data.items ?? [];
      setThreadsState({ kind: "ready", items });
      if (items.length > 0 && !selectedId) setSelectedId(items[0].id);
      if (items.length === 0) {
        setSelectedId(null);
        setThreadState({ kind: "idle" });
      }
    } catch (e) {
      setThreadsState({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to load inbox",
      });
    }
  }

  useEffect(() => {
    void loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly, topicFilter]);

  useEffect(() => {
    let alive = true;
    async function loadThread() {
      if (!selectedId) {
        setThreadState({ kind: "idle" });
        return;
      }
      setThreadState({ kind: "loading" });
      try {
        const thread = await props.getThread(selectedId);
        if (!alive) return;
        setThreadState({ kind: "ready", thread });
      } catch (e) {
        if (!alive) return;
        setThreadState({
          kind: "error",
          message: e instanceof Error ? e.message : "Failed to load thread",
        });
      }
    }

    void loadThread();
    return () => {
      alive = false;
    };
  }, [props, selectedId]);

  const threadItems = useMemo(() => {
    if (threadsState.kind !== "ready") return [];
    return threadsState.items;
  }, [threadsState]);

  const viewerRole: "ADMIN" | "VENDOR" | "CUSTOMER" =
    props.role === "admin"
      ? "ADMIN"
      : props.role === "vendor"
        ? "VENDOR"
        : "CUSTOMER";

  async function submitReply() {
    if (!selectedId || !replyBody.trim()) return;
    setBusyLabel("Sending message...");
    try {
      await props.sendMessage(selectedId, replyBody.trim());
      setReplyBody("");
      await loadThreads();
      const refreshed = await props.getThread(selectedId);
      setThreadState({ kind: "ready", thread: refreshed });
    } catch (e) {
      setThreadState({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to send message",
      });
    } finally {
      setBusyLabel(null);
    }
  }

  async function createThread() {
    if (!props.createThread) return;
    if (!newBody.trim()) return;
    setBusyLabel("Creating thread...");
    try {
      const thread = await props.createThread({
        subject: newSubject.trim() || undefined,
        topic: newTopic,
        body: newBody.trim(),
      });
      setNewBody("");
      setNewSubject("");
      await loadThreads();
      setSelectedId(thread.id);
    } catch (e) {
      setThreadsState({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to create thread",
      });
    } finally {
      setBusyLabel(null);
    }
  }

  return (
    <PortalShell role={props.role} title={props.title} subtitle={props.subtitle}>
      <div className="space-y-5">
        {props.createThread ? (
          <section className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
            <div className="text-sm font-semibold text-primary">Start a new message</div>
            <div className="mt-3 grid gap-3">
              <select
                value={newTopic}
                onChange={(event) => setNewTopic(event.target.value as MessageTopic)}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
              >
                {TOPIC_OPTIONS.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
              <input
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                placeholder="Subject (optional)"
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
              />
              <textarea
                value={newBody}
                onChange={(event) => setNewBody(event.target.value)}
                rows={3}
                placeholder="Write your message..."
                className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted">
                  Conversations are private and visible only to you and admin operators.
                </div>
                <button
                  type="button"
                  disabled={!newBody.trim() || busyLabel !== null}
                  onClick={() => void createThread()}
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
                >
                  Start thread
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-primary">Inbox</div>
            <div className="flex items-center gap-2">
              <select
                value={topicFilter}
                onChange={(event) => setTopicFilter(event.target.value as "ALL" | MessageTopic)}
                className="h-9 rounded-lg border border-line/80 bg-surface px-3 text-xs font-semibold text-primary"
              >
                <option value="ALL">All topics</option>
                {TOPIC_OPTIONS.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-secondary">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(event) => setUnreadOnly(event.target.checked)}
                />
                Unread only
              </label>
            </div>
          </div>

          {busyLabel ? <div className="mt-3 text-xs font-semibold text-secondary">{busyLabel}</div> : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
            <div className="space-y-2">
              {threadsState.kind === "loading" ? (
                <div className="space-y-2">
                  <SkeletonBlock className="h-20" />
                  <SkeletonBlock className="h-20" />
                </div>
              ) : threadsState.kind === "error" ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/12 p-3 text-sm text-danger">
                  {threadsState.message}
                </div>
              ) : threadItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line/80 bg-warm-alt p-4 text-sm text-secondary">
                  No threads found.
                </div>
              ) : (
                threadItems.map((thread) => {
                  const active = selectedId === thread.id;
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setSelectedId(thread.id)}
                      className={[
                        "w-full rounded-2xl border p-3 text-left transition",
                        active
                          ? "border-brand/45 bg-accent-soft/80"
                          : "border-line/80 bg-surface hover:bg-warm-alt",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-primary">
                            {thread.subject || "General support"}
                          </div>
                          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                            {topicLabel(thread.topic)}
                          </div>
                          <div className="mt-1 truncate text-xs text-secondary">
                            {thread.lastMessagePreview || "No messages yet"}
                          </div>
                        </div>
                        {thread.unreadCount > 0 ? (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-accent-text">
                            {thread.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 text-[11px] text-muted">
                        {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleString() : "No activity"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="rounded-2xl border border-line/80 bg-warm-base p-4">
              {threadState.kind === "idle" ? (
                <div className="text-sm text-secondary">Select a thread to read messages.</div>
              ) : threadState.kind === "loading" ? (
                <div className="space-y-2">
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                </div>
              ) : threadState.kind === "error" ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/12 p-3 text-sm text-danger">
                  {threadState.message}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        {threadState.thread.subject || "General support"}
                      </div>
                      <div className="mt-1 text-xs text-secondary">
                        Thread with{" "}
                        {props.role === "admin"
                          ? threadState.thread.counterpartyUser.fullName ||
                            threadState.thread.counterpartyUser.email
                          : threadState.thread.admin.fullName || threadState.thread.admin.email}
                      </div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        {topicLabel(threadState.thread.topic)}
                      </div>
                    </div>
                    <StatusPill status={threadState.thread.counterpartyRole}>
                      {threadState.thread.counterpartyRole}
                    </StatusPill>
                  </div>

                  <div className="max-h-[380px] space-y-2 overflow-auto rounded-2xl border border-line/80 bg-surface p-3">
                    {threadState.thread.messages.map((message) => {
                      const mine = message.sender.role === viewerRole;
                      return (
                        <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={[
                              "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                              mine ? "bg-brand text-accent-text" : "bg-warm-alt text-primary",
                            ].join(" ")}
                          >
                            <div className="whitespace-pre-wrap">{message.body}</div>
                            <div className={`mt-1 text-[10px] ${mine ? "text-inverted/70" : "text-muted"}`}>
                              {new Date(message.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      rows={3}
                      placeholder="Write a reply..."
                      className="w-full rounded-xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={!replyBody.trim() || busyLabel !== null}
                        onClick={() => void submitReply()}
                        className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:opacity-95 disabled:opacity-60"
                      >
                        Send reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
