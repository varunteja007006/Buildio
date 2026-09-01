import { v } from "convex/values";

import { QueryCtx, mutation, query } from "./_generated/server";
import { getUserFromToken } from "./utils";

// Create default settings
const defaultWords = [
  "cat",
  "dog",
  "house",
  "tree",
  "sun",
  "car",
  "book",
  "phone",
  "computer",
  "flower",
  "bird",
  "fish",
  "mountain",
  "ocean",
  "star",
];

// Input caps: Convex arrays allow up to 8192 values and docs up to 1MB;
// bound the canvas so a long session cannot approach either limit.
const MAX_STROKES = 500;
const MAX_POINTS_PER_STROKE = 2048;
const MAX_WORDS = 100;
const MAX_WORD_LENGTH = 64;
const MAX_ROUNDS = 20;
const MIN_TIMER_SECONDS = 30;
const MAX_TIMER_SECONDS = 600;

const strokeValidator = v.object({
  id: v.string(),
  tool: v.string(),
  points: v.array(v.number()),
  strokeWidth: v.number(),
  strokeColor: v.string(),
});

function assertStrokeWithinCaps(stroke: { points: number[] }) {
  if (stroke.points.length > MAX_POINTS_PER_STROKE) {
    throw new Error(`Each line is limited to ${MAX_POINTS_PER_STROKE} points`);
  }
}

async function getRoomOrThrow(ctx: QueryCtx, roomCode: string) {
  const room = await ctx.db
    .query("rooms")
    .withIndex("by_room_code", (q) => q.eq("room_code", roomCode))
    .unique();
  if (!room) throw new Error("Room not found");
  return room;
}

// Get all strokes for a room to render the canvas. One doc per stroke,
// ordered by creation time, so strokes from different players interleave
// in the order they were drawn.
export const getStrokes = query({
  args: { roomCode: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("scribble_lines"),
      strokeId: v.string(),
      playerId: v.id("users"),
      tool: v.string(),
      points: v.array(v.number()),
      strokeWidth: v.number(),
      strokeColor: v.string(),
      isComplete: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const room = await getRoomOrThrow(ctx, args.roomCode);

    const strokes = await ctx.db
      .query("scribble_lines")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .take(MAX_STROKES);

    return strokes
      .filter((stroke) => stroke.strokeId !== undefined)
      .map((stroke) => ({
        _id: stroke._id,
        strokeId: stroke.strokeId!,
        playerId: stroke.playerId,
        tool: stroke.tool,
        points: stroke.points!,
        strokeWidth: stroke.strokeWidth!,
        strokeColor: stroke.strokeColor!,
        isComplete: stroke.isComplete,
      }));
  },
});

// Save a single stroke. Called on mousedown, throttled during mousemove,
// and on mouseup. Upserts by the client-generated stroke id so in-progress
// point streaming patches the same doc, and concurrent drawers never
// overwrite each other's strokes.
export const saveStroke = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
    stroke: strokeValidator,
    isComplete: v.optional(v.boolean()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    assertStrokeWithinCaps(args.stroke);

    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success || !user.id) throw new Error("Unauthorized");

    const room = await getRoomOrThrow(ctx, args.roomCode);

    const existing = await ctx.db
      .query("scribble_lines")
      .withIndex("by_room_and_stroke", (q) =>
        q.eq("roomId", room._id).eq("strokeId", args.stroke.id),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        points: args.stroke.points,
        tool: args.stroke.tool,
        strokeWidth: args.stroke.strokeWidth,
        strokeColor: args.stroke.strokeColor,
        isComplete: args.isComplete ?? existing.isComplete,
        updated_at: Date.now(),
      });
      return { success: true, message: "Stroke updated" };
    }

    const strokeCount = await ctx.db
      .query("scribble_lines")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();
    if (strokeCount.length >= MAX_STROKES) {
      throw new Error(`Canvas is limited to ${MAX_STROKES} lines`);
    }

    await ctx.db.insert("scribble_lines", {
      roomId: room._id,
      playerId: user.id,
      strokeId: args.stroke.id,
      tool: args.stroke.tool,
      points: args.stroke.points,
      strokeWidth: args.stroke.strokeWidth,
      strokeColor: args.stroke.strokeColor,
      isComplete: args.isComplete ?? false,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    return { success: true, message: "Stroke created" };
  },
});

// Clear the canvas
export const clearCanvas = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
  },
  returns: v.null(),
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

    return null;
  },
});

// Get game settings for a room
export const getGameSettings = query({
  args: { roomCode: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("scribble_games"),
      _creationTime: v.number(),
      room_code: v.string(),
      rounds: v.number(),
      timer: v.number(),
      list_of_words: v.array(v.string()),
      word_filters: v.optional(v.array(v.string())),
      score: v.record(v.string(), v.number()),
      created_at: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("scribble_games")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!settings) return null;

    return {
      _id: settings._id,
      _creationTime: settings._creationTime,
      room_code: settings.room_code,
      rounds: settings.rounds,
      timer: settings.timer,
      list_of_words: settings.list_of_words,
      word_filters: settings.word_filters,
      score: settings.score,
      created_at: settings.created_at,
    };
  },
});

// Initialize default game settings for a room (called on room join by owner)
export const initializeGameSettings = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
  },
  returns: v.union(v.id("scribble_games"), v.null()),
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

    const settingsId = await ctx.db.insert("scribble_games", {
      room_code: args.roomCode,
      rounds: 1,
      timer: 120,
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
  returns: v.id("scribble_games"),
  handler: async (ctx, args) => {
    if (args.rounds < 1 || args.rounds > MAX_ROUNDS) {
      throw new Error(`Rounds must be between 1 and ${MAX_ROUNDS}`);
    }
    if (args.timer < MIN_TIMER_SECONDS || args.timer > MAX_TIMER_SECONDS) {
      throw new Error(
        `Timer must be between ${MIN_TIMER_SECONDS} and ${MAX_TIMER_SECONDS} seconds`,
      );
    }
    if (args.list_of_words.length > MAX_WORDS) {
      throw new Error(`Word list is limited to ${MAX_WORDS} words`);
    }
    for (const word of args.list_of_words) {
      if (word.length === 0 || word.length > MAX_WORD_LENGTH) {
        throw new Error(
          `Each word must be between 1 and ${MAX_WORD_LENGTH} characters`,
        );
      }
    }

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
