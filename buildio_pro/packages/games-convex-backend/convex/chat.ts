import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserFromToken } from "./utils";

export const getMessages = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) return [];

    const messages = await ctx.db
      .query("chats")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    // Enrich messages with user details
    const messagesWithUser = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return {
          ...msg,
          sender: user?.username || "Unknown",
        };
      }),
    );

    return messagesWithUser;
  },
});

export const sendMessage = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success || !user.id) throw new Error("User not found");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    // TODO: Get current word and check if message matches
    const isGuess = false;

    await ctx.db.insert("chats", {
      roomId: room._id,
      userId: user.id,
      message: isGuess ? "Guessed the word!✅" : args.message,
      isGuess,
      created_at: Date.now(),
    });
  },
});

export const getTeamReactions = query({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success || !user.id) throw new Error("User not found");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    const reactions = await ctx.db
      .query("team_reactions")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .order("desc")
      .take(20); // Grab the 20 most recent reactions

    return reactions;
  },
});

export const createTeamReaction = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
    reaction: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success || !user.id) throw new Error("User not found");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    await ctx.db.insert("team_reactions", {
      roomId: room._id,
      userId: user.id,
      reaction: args.reaction,
    });
  },
});
