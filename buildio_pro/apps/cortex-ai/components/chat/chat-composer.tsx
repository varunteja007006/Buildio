"use client";

import { Button } from "@workspace/ui/components/button";
import { Send, Square } from "lucide-react";
import { useState } from "react";

type ChatComposerProps = {
  isStreaming: boolean;
  disabled?: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

/** Message input with send/stop controls. */
export function ChatComposer({
  isStreaming,
  disabled = false,
  onSend,
  onStop,
}: ChatComposerProps) {
  const [input, setInput] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="border-t p-4">
      <form onSubmit={submit} className="flex items-end gap-2">
        <textarea
          className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          rows={1}
          value={input}
          placeholder="Ask a question…"
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
        />
        {isStreaming ? (
          <Button type="button" size="icon" variant="outline" onClick={onStop}>
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || disabled}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
