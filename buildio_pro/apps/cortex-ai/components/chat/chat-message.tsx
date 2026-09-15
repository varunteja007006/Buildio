"use client";

import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";
import { MessageScrollerItem } from "@workspace/ui/components/message-scroller";
import { RelativeTime } from "@workspace/ui/components/relative-time";
import { isToolUIPart, type UIMessage } from "ai";

import type { ChatMessageMetadata } from "@/api/chat/types";
import { ToolCalls } from "@/components/chat/tool-calls";

type ChatMessageProps = {
  message: UIMessage<ChatMessageMetadata>;
  /** Model id that produced this assistant reply, when known. */
  modelId?: string;
  /** Resolve a model id to a display label. */
  labelForModel?: (modelId: string) => string;
};

/** Renders a single chat turn (user or assistant) inside the message scroller. */
export function ChatMessage({
  message,
  modelId,
  labelForModel,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const toolParts = message.parts.filter(isToolUIPart);
  const textParts = message.parts.filter((part) => part.type === "text");
  const createdAt = message.metadata?.createdAt;
  const modelLabel =
    modelId && labelForModel ? labelForModel(modelId) : undefined;

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={isUser}
      className="flex flex-col"
    >
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <span className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
          {isUser ? "You" : "Assistant"}
        </span>

        {/* Tool calls live in their own collapsible block, separate from the
            assistant's text response. */}
        {toolParts.length > 0 ? <ToolCalls parts={toolParts} /> : null}

        {textParts.length > 0 ? (
          <Bubble
            align={isUser ? "end" : "start"}
            variant={isUser ? "default" : "muted"}
          >
            <BubbleContent className="whitespace-pre-wrap">
              {textParts.map((part, i) => (
                <p key={i}>{part.text}</p>
              ))}
            </BubbleContent>
          </Bubble>
        ) : null}

        {modelLabel || createdAt ? (
          <div className="mt-1 flex items-center gap-1.5 px-1 text-xs text-muted-foreground/70">
            {modelLabel ? <span>via {modelLabel}</span> : null}
            {modelLabel && createdAt ? <span aria-hidden>·</span> : null}
            {createdAt ? <RelativeTime date={createdAt} /> : null}
          </div>
        ) : null}
      </div>
    </MessageScrollerItem>
  );
}
