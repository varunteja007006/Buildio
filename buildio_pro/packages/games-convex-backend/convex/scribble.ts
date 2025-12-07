import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserFromToken } from "./utils";

// Get all lines for a room to render the canvas
export const getLines = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) return [];

    const lines = await ctx.db
      .query("scribble_lines")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    return lines;
  },
});

// Start a new line (onMouseDown)
export const startStroke = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
    tool: v.string(),
    points: v.array(v.number()), // [x, y]
    strokeWidth: v.number(),
    strokeColor: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success || !user.id) throw new Error("User not found");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    const lineId = await ctx.db.insert("scribble_lines", {
      roomId: room._id,
      playerId: user.id,
      tool: args.tool,
      points: args.points,
      strokeWidth: args.strokeWidth,
      strokeColor: args.strokeColor,
      isComplete: false,
    });

    return lineId;
  },
});

// Append points to the current line (onMouseMove)
// Note: You should throttle this call on the client side (e.g., every 50-100ms)
export const updateStroke = mutation({
  args: {
    lineId: v.id("scribble_lines"),
    newPoints: v.array(v.number()), // New points to append
  },
  handler: async (ctx, args) => {
    const line = await ctx.db.get(args.lineId);
    if (!line) throw new Error("Line not found");

    await ctx.db.patch(args.lineId, {
      points: [...line.points, ...args.newPoints],
    });
  },
});

// Mark line as complete (onMouseUp)
export const endStroke = mutation({
  args: {
    lineId: v.id("scribble_lines"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lineId, {
      isComplete: true,
    });
  },
});

// Clear the canvas
export const clearCanvas = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success) throw new Error("Unauthorized");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    const lines = await ctx.db
      .query("scribble_lines")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    for (const line of lines) {
      await ctx.db.delete(line._id);
    }
  },
});

// Get game settings for a room
export const getGameSettings = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("scribble_games")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    return settings || null;
  },
});

// Initialize default game settings for a room (called on room join by owner)
export const initializeGameSettings = mutation({
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

    // Only owner can initialize settings
    if (room.ownerId !== user.id) return null;

    // Check if settings already exist
    const existingSettings = await ctx.db
      .query("scribble_games")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (existingSettings) return existingSettings._id;

    // Create default settings
    const defaultWords = [
      "cat", "dog", "house", "tree", "sun", "car", "book", "phone",
      "computer", "flower", "bird", "fish", "mountain", "ocean", "star"
    ];

    const settingsId = await ctx.db.insert("scribble_games", {
      room_code: args.roomCode,
      rounds: 5,
      timer: 60,
      list_of_words: defaultWords,
      word_filters: [],
      score: {},
      created_at: Date.now(),
    });

    return settingsId;
  },
});

// Update game settings (only modifies existing settings)
export const updateGameSettings = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
    rounds: v.number(),
    timer: v.number(),
    list_of_words: v.array(v.string()),
    word_filters: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success || !user.id) throw new Error("User not found");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    // Only owner can modify settings
    if (room.ownerId !== user.id) {
      throw new Error("Only room owner can modify game settings");
    }

    const existingSettings = await ctx.db
      .query("scribble_games")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!existingSettings) throw new Error("Game settings not found");

    await ctx.db.patch(existingSettings._id, {
      rounds: args.rounds,
      timer: args.timer,
      list_of_words: args.list_of_words,
      word_filters: args.word_filters,
    });

    return existingSettings._id;
  },
});
