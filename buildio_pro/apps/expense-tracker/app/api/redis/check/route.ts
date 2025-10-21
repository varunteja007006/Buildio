import { valkeyClient } from "@/lib/redis";
import { NextResponse } from "next/server";

const CHECK_KEY = "REDIS_CHECK:redis-check";

export async function GET() {
  try {
    const res = await valkeyClient.get(CHECK_KEY);
    return NextResponse.json(`Cache retrieval response: ${res}`, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Getting from cache failed", {
      status: 500,
    });
  }
}

export async function POST() {
  try {
    const res = await valkeyClient.set(
      CHECK_KEY,
      "Redis is saving the items in cache"
    );
    return NextResponse.json(`Cache setting response: ${res}`, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Setting in cache failed", {
      status: 500,
    });
  }
}

export async function DELETE() {
  try {
    const res = await valkeyClient.del(CHECK_KEY);
    return NextResponse.json(`Cache deleted response: ${res}`, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Deleting from cache failed", {
      status: 500,
    });
  }
}
