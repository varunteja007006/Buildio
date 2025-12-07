import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
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
