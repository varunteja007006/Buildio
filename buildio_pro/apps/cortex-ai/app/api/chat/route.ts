import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
  isStepCount,
} from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

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

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-4o",
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