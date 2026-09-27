"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  chatKeys,
  useChatThread,
} from "@/api/chat/query";
import { useCreateOrGetEmptyThread } from "@/api/chat/query";
import type { ChatMessageMetadata, ChatMessageRecord } from "@/api/chat/types";
import { endpoints } from "@/api/endpoints";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessage } from "@/components/chat/chat-message";
import { MessageFeedback } from "@/components/chat/message-feedback";

function toUIMessages(
  records: ChatMessageRecord[],
): UIMessage<ChatMessageMetadata>[] {
  return records.map((record) => ({
    id: record.id,
    role: record.role,
    metadata: { createdAt: record.createdAt },
    parts: [{ type: "text", text: record.content }],
  }));
}

/**
 * Playground chat bound to an agent. Threads are created with the agent id so
 * retrieval is topic-scoped, the system prompt comes from the agent, and the
 * deploy gate can verify a test-run happened.
 */
export function AgentPlayground({
  agentId,
  agentName,
}: {
  agentId: string;
  agentName: string;
}) {
  const queryClient = useQueryClient();
  const createThread = useCreateOrGetEmptyThread();

  const [threadId, setThreadId] = useState<string | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    createThread.mutate(agentId, {
      onSuccess: (data) => setThreadId(data.thread.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const { data: threadData } = useChatThread(threadId ?? "");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api${endpoints.chat.stream}`,
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, threadId, agentId },
        }),
      }),
    [threadId, agentId],
  );

  const onFinish = useCallback(() => {
    if (threadId)
      queryClient.invalidateQueries({ queryKey: chatKeys.thread(threadId) });
  }, [queryClient, threadId]);

  const { messages, setMessages, sendMessage, status, stop } = useChat<
    UIMessage<ChatMessageMetadata>
  >({
    id: threadId ?? "pending",
    transport,
    onFinish,
  });

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || !threadData) return;
    setMessages(toUIMessages(threadData.messages));
    hydratedRef.current = true;
  }, [threadData, setMessages]);

  const timestampsRef = useRef<Map<string, string>>(new Map());
  const messagesWithTime = useMemo<UIMessage<ChatMessageMetadata>[]>(
    () =>
      messages.map((message) => {
        if (message.metadata?.createdAt) return message;
        let createdAt = timestampsRef.current.get(message.id);
        if (!createdAt) {
          createdAt = new Date().toISOString();
          timestampsRef.current.set(message.id, createdAt);
        }
        return { ...message, metadata: { ...message.metadata, createdAt } };
      }),
    [messages],
  );

  const isStreaming = status === "streaming";

  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: agentName, href: `/dashboard/agent/${agentId}` },
          { label: "Playground" },
        ]}
      />
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">
            {agentName} · playground
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/agent/${agentId}`}>Back to agent</Link>
          </Button>
        </div>
        <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-4 p-4">
                {!threadId ? (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Preparing playground…
                    </p>
                  </div>
                ) : null}
                {threadId && messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Test the agent here. Deploy is unlocked after a
                      successful test run.
                    </p>
                  </div>
                ) : null}
                {messagesWithTime.map((message) => (
                  <ChatMessage key={message.id} message={message}>
                    {message.role === "assistant" && threadId ? (
                      <MessageFeedback
                        threadId={threadId}
                        messageId={message.id}
                      />
                    ) : null}
                  </ChatMessage>
                ))}
                {isStreaming && messages.length > 0 ? (
                  <MessageScrollerItem className="flex items-start">
                    <span className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                      Assistant
                    </span>
                    <span className="ml-2 animate-pulse text-sm">▍</span>
                  </MessageScrollerItem>
                ) : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
        <ChatComposer
          isStreaming={isStreaming}
          onSend={(text) => sendMessage({ text })}
          onStop={stop}
        />
      </div>
    </>
  );
}