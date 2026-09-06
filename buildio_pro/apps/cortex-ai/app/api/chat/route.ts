import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
  isStepCount,
} from "ai";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import {
  DEFAULT_CHAT_MODEL_ID,
  isWellFormedChatModelId,
} from "@/lib/chat/models";
import { getOrCreateChatPreferences } from "@/lib/chat/preferences";
import { db } from "@/lib/db";
import { chatThreads } from "@/lib/db/schema/threads";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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

  let resolvedModel = DEFAULT_CHAT_MODEL_ID;

  if (model != null) {
    if (!isWellFormedChatModelId(model)) {
      return NextResponse.json(
        { success: false, error: "Invalid model" },
        { status: 400 },
      );
    }
    resolvedModel = model;
  } else if (typeof threadId === "string" && threadId) {
    const [thread] = await db
      .select({ model: chatThreads.model })
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, threadId),
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspace.id),
        ),
      );
    if (thread?.model) {
      resolvedModel = thread.model;
    } else {
      const preferences = await getOrCreateChatPreferences(user.id);
      resolvedModel = preferences.defaultModel;
    }
  } else {
    const preferences = await getOrCreateChatPreferences(user.id);
    resolvedModel = preferences.defaultModel;
  }

  const result = streamText({
    model: resolvedModel,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
Only respond to questions using information from tool calls.
If no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
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
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
