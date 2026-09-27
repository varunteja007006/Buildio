"use client";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useState } from "react";

import { upsertMessageFeedback } from "@/api/chat/api";

/**
 * Thumbs up/down + optional comment feedback on an assistant message.
 * Re-rating upserts the single feedback row for the message.
 */
export function MessageFeedback({
  threadId,
  messageId,
}: {
  threadId: string;
  messageId: string;
}) {
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const choose = async (rating: "up" | "down") => {
    const next = choice === rating ? null : rating;
    setChoice(next);
    setSaved(false);
    if (!next) return;
    setPending(true);
    try {
      await upsertMessageFeedback(threadId, messageId, { rating: next });
      setSaved(true);
    } catch {
      // Silent: feedback is best-effort; user can retry.
    } finally {
      setPending(false);
    }
  };

  const saveComment = async () => {
    if (!choice) return;
    setPending(true);
    try {
      await upsertMessageFeedback(threadId, messageId, {
        rating: choice,
        comment: comment.trim() || undefined,
      });
      setSaved(true);
    } catch {
      // Silent: feedback is best-effort; user can retry.
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-1 flex flex-col items-start gap-1 px-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Button
          variant={choice === "up" ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={() => choose("up")}
          disabled={pending}
          aria-label="Good response"
        >
          <ThumbsUpIcon />
        </Button>
        <Button
          variant={choice === "down" ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={() => choose("down")}
          disabled={pending}
          aria-label="Bad response"
        >
          <ThumbsDownIcon />
        </Button>
        {saved ? <span className="text-xs">Feedback saved</span> : null}
      </div>
      {choice === "down" ? (
        <div className="flex w-full max-w-sm items-end gap-1">
          <Textarea
            rows={1}
            placeholder="What went wrong? (optional)"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="min-h-0 text-xs"
          />
          <Button size="sm" variant="outline" onClick={saveComment} disabled={pending}>
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
}