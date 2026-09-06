import { NextResponse } from "next/server";

import { isWellFormedChatModelId } from "@/lib/chat/models";
import {
  getOrCreateChatPreferences,
  setDefaultChatModel,
} from "@/lib/chat/preferences";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const preferences = await getOrCreateChatPreferences(user.id);
    return NextResponse.json({ defaultModel: preferences.defaultModel });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const defaultModel = body?.defaultModel;

    if (!isWellFormedChatModelId(defaultModel)) {
      return NextResponse.json(
        { success: false, error: "Invalid model" },
        { status: 400 },
      );
    }

    const preferences = await setDefaultChatModel(user.id, defaultModel);
    return NextResponse.json({ defaultModel: preferences.defaultModel });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
