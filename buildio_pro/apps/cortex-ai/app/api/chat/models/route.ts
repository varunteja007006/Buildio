import { NextResponse } from "next/server";

import { getChatModels } from "@/lib/chat/catalog";
import { getDefaultChatModelId } from "@/lib/chat/models";

export async function GET() {
  try {
    const models = await getChatModels();
    return NextResponse.json({
      models,
      defaultModel: getDefaultChatModelId(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
