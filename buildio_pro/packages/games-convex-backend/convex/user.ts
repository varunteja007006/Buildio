import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { getUserFromToken } from "./utils";

export const createUser = mutation({
  args: {
    name: v.string(),
    roomCode: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    token: v.string(),
    userId: v.id("users"),
    teamId: v.optional(v.id("teams")),
  }),

  handler: async (ctx, args) => {
    const token = globalThis.crypto.randomUUID();
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      username: args.name,
      user_token: token,
      created_at: now,
      last_active: now,
    });

    let message = "User created successfully";
    let teamId: Id<"teams"> | undefined;

    if (args.roomCode) {
      const roomCode = args.roomCode;
      const room = await ctx.db
        .query("rooms")
        .withIndex("by_room_code", (q) => q.eq("room_code", roomCode))
        .unique();

      if (room) {
        teamId = await ctx.db.insert("teams", {
          roomId: room._id,
          userId,
          created_at: now,
        });
        message = "User created and joined room successfully";
      } else {
        message =
          "User created successfully, but room not found. Please join the room separately.";
      }
    }

    return {
      success: true,
      message,
      token,
      userId,
      teamId,
    };
  },
});

export const getUserByToken = query({
  args: {
    token: v.string(),
  },
  returns: v.union(
    v.object({
      id: v.id("users"),
      username: v.string(),
      success: v.boolean(),
      message: v.string(),
      isFound: v.boolean(),
    }),
    v.object({
      success: v.boolean(),
      message: v.string(),
      isFound: v.boolean(),
    })
  ),

  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token);
    return user;
  },
});
