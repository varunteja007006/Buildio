"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@workspace/ui/components/button";
import { isToolUIPart, getToolName } from "ai";
import { Send, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  useChatModels,
  useChatPreferences,
  useUpdateChatPreferences,
} from "@/api/chat/query";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { ChatModelSelector } from "@/components/chat/chat-model-selector";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: modelsData, isLoading: modelsLoading } = useChatModels();
  const { data: preferences } = useChatPreferences();
  const updatePreferences = useUpdateChatPreferences();

  // Model used for each user turn, in order — lets us annotate assistant
  // replies with the model that actually produced them.
  const turnModelsRef = useRef<string[]>([]);

  const models = useMemo(() => modelsData?.models ?? [], [modelsData]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const activeModel =
    selectedModel ??
    preferences?.defaultModel ??
    modelsData?.defaultModel ??
    undefined;

  const labelForModel = useMemo(() => {
    const byId = new Map(models.map((model) => [model.id, model.label]));
    return (modelId: string) => byId.get(modelId) ?? modelId;
  }, [models]);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const isStreaming = status === "streaming";

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    updatePreferences.mutate({ defaultModel: modelId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const model = activeModel;
    if (model) turnModelsRef.current.push(model);
    sendMessage(
      { text: input.trim() },
      model ? { body: { model } } : undefined,
    );
    setInput("");
  };

  // Resolve which model produced the assistant message at the given index.
  const modelForMessage = (index: number): string | undefined => {
    let userTurns = 0;
    for (let i = 0; i < index; i++) {
      if (messages[i].role === "user") userTurns++;
    }
    if (userTurns === 0) return undefined;
    return turnModelsRef.current[userTurns - 1] ?? activeModel;
  };

  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Chat" },
        ]}
      />
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
        {/* Model toolbar */}
        <div className="flex items-center justify-end gap-2 border-b px-3 py-2">
          <ChatModelSelector
            models={models}
            value={activeModel}
            loading={modelsLoading && models.length === 0}
            saving={updatePreferences.isPending}
            onSelect={handleSelectModel}
          />
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Ask me anything — I&apos;ll search my knowledge base for the
                answer.
              </p>
            </div>
          )}

          {messages.map((m, index) => {
            const modelId =
              m.role === "assistant" ? modelForMessage(index) : undefined;
            return (
              <div key={m.id} className="flex flex-col">
                <div
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                    {m.role === "user" ? "You" : "Assistant"}
                  </span>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return <p key={i}>{part.text}</p>;
                        default: {
                          if (isToolUIPart(part)) {
                            const toolName = getToolName(part);
                            const toolInput = part.input ?? {};
                            const isComplete =
                              part.state === "output-available" ||
                              part.state === "output-error" ||
                              part.state === "output-denied";
                            return (
                              <p
                                key={i}
                                className="text-xs text-muted-foreground"
                              >
                                {isComplete
                                  ? `✓ Used tool: ${toolName}`
                                  : `⚙ Calling tool: ${toolName}…`}
                                <pre className="mt-1 rounded bg-muted-foreground/10 p-2 text-xs">
                                  {JSON.stringify(toolInput, null, 2)}
                                </pre>
                              </p>
                            );
                          }
                          return null;
                        }
                      }
                    })}
                  </div>
                </div>
                {modelId && (
                  <span className="mt-1 text-xs text-muted-foreground/70">
                    via {labelForModel(modelId)}
                  </span>
                )}
              </div>
            );
          })}

          {isStreaming && messages.length > 0 && (
            <div className="flex items-start">
              <span className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                Assistant
              </span>
              <span className="ml-2 animate-pulse text-sm">▍</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              rows={1}
              value={input}
              placeholder="Ask a question…"
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={stop}
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
