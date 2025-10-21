import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { Presence } from "@convex-dev/presence";
import type { Id } from "./_generated/dataModel";

export const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    if (!userId) {
      throw new Error("Id not valid");
    }

    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    const peeps = await presence.list(ctx, roomToken);

    const peepsWithNames = await Promise.all(
      peeps.map(async (p) => {
        if (!p.userId) {
          return null;
        }

        const user = await ctx.db.get(p.userId as Id<"users">);
        if (!user) {
          return null;
        }

        return {
          ...p,
          name: user.username ?? "Unknown",
        };
      })
    );

    return peepsWithNames.filter((p) => p !== null);
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    // Can't check auth here because it's called over http from sendBeacon.
    return await presence.disconnect(ctx, sessionToken);
  },
});
