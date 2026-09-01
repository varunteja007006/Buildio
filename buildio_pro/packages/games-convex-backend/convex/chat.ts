import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserFromToken } from "./utils";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_REACTION_LENGTH = 64;
const MAX_MESSAGES_RETURNED = 100;

export const getMessages = query({
  args: { roomCode: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("chats"),
      _creationTime: v.number(),
      roomId: v.id("rooms"),
      userId: v.id("users"),
      message: v.string(),
      isGuess: v.optional(v.boolean()),
      created_at: v.number(),
      sender: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) return [];

    // Cap history shipped to subscribers: most recent messages only.
    const messages = await ctx.db
      .query("chats")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .order("desc")
      .take(MAX_MESSAGES_RETURNED);

    // Enrich with user details, restoring chronological order.
    const messagesWithUser = await Promise.all(
      messages.reverse().map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return {
          _id: msg._id,
          _creationTime: msg._creationTime,
          roomId: msg.roomId,
          userId: msg.userId,
          message: msg.message,
          isGuess: msg.isGuess,
          created_at: msg.created_at,
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
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.message.length === 0 || args.message.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`,
      );
    }

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

    return null;
  },
});

export const getTeamReactions = query({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("team_reactions"),
      _creationTime: v.number(),
      roomId: v.id("rooms"),
      userId: v.id("users"),
      reaction: v.string(),
    }),
  ),
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

    return reactions.map((reaction) => ({
      _id: reaction._id,
      _creationTime: reaction._creationTime,
      roomId: reaction.roomId,
      userId: reaction.userId,
      reaction: reaction.reaction,
    }));
  },
});

export const createTeamReaction = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
    reaction: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.reaction.length === 0 || args.reaction.length > MAX_REACTION_LENGTH) {
      throw new Error(
        `Reaction must be between 1 and ${MAX_REACTION_LENGTH} characters`,
      );
    }

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
      created_at: Date.now(),
    });

    return null;
  },
});
