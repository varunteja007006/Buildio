import { NextResponse } from "next/server";

import { getChatModels } from "@/lib/chat/catalog";
import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat/models";

export async function GET() {
  try {
    const models = await getChatModels();
    return NextResponse.json({ models, defaultModel: DEFAULT_CHAT_MODEL_ID });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
