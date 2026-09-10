import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import {
  getLastUserQuery,
  recordBlockedChatAudit,
  recordChatAudit,
} from "@/lib/chat/audit";
import { GUARDRAIL_REFUSAL, scanUserQuery } from "@/lib/chat/guardrail";
import {
  deriveThreadTitle,
  getLastUserMessage,
  getMessageText,
  persistAssistantMessage,
  persistUserMessage,
} from "@/lib/chat/messages";
import {
  DEFAULT_CHAT_MODEL_ID,
  isWellFormedChatModelId,
} from "@/lib/chat/models";
import { getOrCreateChatPreferences } from "@/lib/chat/preferences";
import { getThreadForUser, touchThread } from "@/lib/chat/threads";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a helpful assistant. Check your knowledge base before answering any questions.
Only respond to questions using information from tool calls.
If no relevant information is found in the tool calls, respond, "Sorry, I don't know."`;

function buildRefusalStream(messageId: string) {
  return createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start", messageId });
      writer.write({ type: "text-start", id: messageId });
      writer.write({
        type: "text-delta",
        id: messageId,
        delta: GUARDRAIL_REFUSAL,
      });
      writer.write({ type: "text-end", id: messageId });
      writer.write({ type: "finish", finishReason: "content-filter" });
    },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const workspace = await getActiveWorkspace(user.id);
  if (!workspace) {
    return NextResponse.json(
      { success: false, error: "No active workspace" },
      { status: 400 },
    );
  }

  const { messages, model, threadId }: {
    messages: UIMessage[];
    model?: string;
    threadId?: string;
  } = await req.json();

  let thread = null;
  if (typeof threadId === "string" && threadId) {
    thread = await getThreadForUser(threadId, user.id, workspace.id);
    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 },
      );
    }
  }

  let resolvedModel = DEFAULT_CHAT_MODEL_ID;
  if (model != null) {
    if (!isWellFormedChatModelId(model)) {
      return NextResponse.json(
        { success: false, error: "Invalid model" },
        { status: 400 },
      );
    }
    resolvedModel = model;
  } else if (thread?.model) {
    resolvedModel = thread.model;
  } else {
    const preferences = await getOrCreateChatPreferences(user.id);
    resolvedModel = preferences.defaultModel;
  }

  const userMessage = getLastUserMessage(messages);
  const userQuery = userMessage
    ? getMessageText(userMessage)
    : getLastUserQuery(messages);

  const guardrail = await scanUserQuery(userQuery);

  if (thread) {
    if (userMessage) {
      await persistUserMessage(thread.id, userMessage);
    }
    await touchThread({
      threadId: thread.id,
      userId: user.id,
      workspaceId: workspace.id,
      title: userQuery ? deriveThreadTitle(userQuery) : undefined,
      model: resolvedModel,
    });
  }

  // Guardrail: refuse risky queries before calling the chat model.
  if (guardrail.blocked) {
    const messageId = crypto.randomUUID();

    if (thread) {
      await persistAssistantMessage(
        thread.id,
        messageId,
        GUARDRAIL_REFUSAL,
      );
    }

    void recordBlockedChatAudit({
      userId: user.id,
      workspaceId: workspace.id,
      threadId: thread?.id,
      model: resolvedModel,
      userQuery,
      guardrail,
    }).catch((error) => {
      console.error("Failed to record blocked chat audit log", error);
    });

    return createUIMessageStreamResponse({
      stream: buildRefusalStream(messageId),
    });
  }

  const result = streamText({
    model: resolvedModel,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    include: { requestBody: true, requestMessages: true },
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        inputSchema: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => createResource(content, workspace.id),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        inputSchema: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({ question }) =>
          findRelevantContent(question, workspace.id),
      }),
    },
    onEnd: (event) => {
      void recordChatAudit({
        userId: user.id,
        workspaceId: workspace.id,
        threadId: thread?.id,
        model: resolvedModel,
        userQuery,
        event,
        guardrail,
      }).catch((error) => {
        console.error("Failed to record chat audit log", error);
      });
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      onEnd: async ({ responseMessage }) => {
        if (!thread) return;
        const content = getMessageText(responseMessage);
        if (!content) return;
        try {
          await persistAssistantMessage(
            thread.id,
            responseMessage.id,
            content,
          );
          await touchThread({
            threadId: thread.id,
            userId: user.id,
            workspaceId: workspace.id,
          });
        } catch (error) {
          console.error("Failed to persist assistant message", error);
        }
      },
    }),
  });
}
