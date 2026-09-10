"use client";

import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";
import { MessageScrollerItem } from "@workspace/ui/components/message-scroller";
import { isToolUIPart, type UIMessage } from "ai";

import { ToolCalls } from "@/components/chat/tool-calls";

type ChatMessageProps = {
  message: UIMessage;
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

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={isUser}
      className="flex flex-col"
    >
      <div
        className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
      >
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
      </div>
      {modelId && labelForModel ? (
        <span className="mt-1 text-xs text-muted-foreground/70">
          via {labelForModel(modelId)}
        </span>
      ) : null}
    </MessageScrollerItem>
  );
}
