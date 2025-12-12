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

// Save the line strokes drawn by a player
export const createLineStrokes = mutation({
  args: {
    roomCode: v.string(),
    userToken: v.string(),
    tool: v.string(),
    lines: v.array(
      v.object({
        id: v.string(),
        tool: v.string(),
        points: v.array(v.number()),
        strokeWidth: v.number(),
        strokeColor: v.string(),
      }),
    ),
    isComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.userToken);
    if (!user.success) throw new Error("Unauthorized");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    // Get the shared canvas for the room
    const lines = await ctx.db
      .query("scribble_lines")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    // Find the shared canvas record (not per-player)
    const sharedCanvas = lines[0];

    if (sharedCanvas) {
      // Update the shared canvas with new lines
      await ctx.db.patch(sharedCanvas._id, {
        tool: args.tool,
        lines: args.lines,
        isComplete: args.isComplete,
        updated_at: Date.now(),
      });
      return { success: true, message: "Canvas updated" };
    } else {
      // Create the shared canvas for the room
      await ctx.db.insert("scribble_lines", {
        roomId: room._id,
        playerId: user.id!, // Just for reference, not used for filtering
        tool: args.tool,
        lines: args.lines,
        isComplete: args.isComplete,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      return { success: true, message: "Canvas created" };
    }
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

// // Get game state for a room
// export const getGameState = query({
//   args: { roomCode: v.string() },
//   handler: async (ctx, args) => {
//     const gameState = await ctx.db
//       .query("scribble_game_state")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     return gameState || null;
//   },
// });

// // Start the game
// export const startGame = mutation({
//   args: {
//     roomCode: v.string(),
//     userToken: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const user = await getUserFromToken(ctx, args.userToken);
//     if (!user.success || !user.id) throw new Error("User not found");

//     const room = await ctx.db
//       .query("rooms")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     if (!room) throw new Error("Room not found");

//     // Only owner can start game
//     if (room.ownerId !== user.id) {
//       throw new Error("Only room owner can start the game");
//     }

//     // Get game settings
//     const settings = await ctx.db
//       .query("scribble_games")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     if (!settings) throw new Error("Game settings not found");

//     // Check if game already started
//     const existingState = await ctx.db
//       .query("scribble_game_state")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     if (existingState && existingState.status === "playing") {
//       throw new Error("Game already in progress");
//     }

//     // Get all team members in the room
//     const teamMembers = await ctx.db
//       .query("teams")
//       .withIndex("by_room", (q) => q.eq("roomId", room._id))
//       .collect();

//     if (teamMembers.length === 0) {
//       throw new Error("No players in the room");
//     }

//     // Calculate total turns
//     const totalTurns = settings.rounds * teamMembers.length;

//     // Pick random word
//     const randomWord = settings.list_of_words[
//       Math.floor(Math.random() * settings.list_of_words.length)
//     ];

//     const now = Date.now();

//     // Delete old game state if exists
//     if (existingState) {
//       await ctx.db.delete(existingState._id);
//     }

//     // Create new game state
//     const gameStateId = await ctx.db.insert("scribble_game_state", {
//       room_code: args.roomCode,
//       status: "playing",
//       currentTurn: 1,
//       totalTurns,
//       currentWord: randomWord,
//       turnStartTime: now,
//       turnDuration: settings.timer,
//       created_at: now,
//       updated_at: now,
//     });

//     return gameStateId;
//   },
// });

// // Move to next turn
// export const nextTurn = mutation({
//   args: {
//     roomCode: v.string(),
//     userToken: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const user = await getUserFromToken(ctx, args.userToken);
//     if (!user.success) throw new Error("Unauthorized");

//     const gameState = await ctx.db
//       .query("scribble_game_state")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     if (!gameState) throw new Error("Game not found");

//     if (gameState.status !== "playing") {
//       throw new Error("Game is not in progress");
//     }

//     // Get settings for word list
//     const settings = await ctx.db
//       .query("scribble_games")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     if (!settings) throw new Error("Game settings not found");

//     const nextTurnNumber = gameState.currentTurn + 1;

//     // Check if game is finished (already completed all turns)
//     if (gameState.currentTurn === gameState.totalTurns) {
//       await ctx.db.patch(gameState._id, {
//         status: "finished",
//         updated_at: Date.now(),
//       });
//       return { status: "finished" };
//     }

//     // Pick new random word
//     const randomWord = settings.list_of_words[
//       Math.floor(Math.random() * settings.list_of_words.length)
//     ];

//     // Update to next turn
//     await ctx.db.patch(gameState._id, {
//       currentTurn: nextTurnNumber,
//       currentWord: randomWord,
//       turnStartTime: Date.now(),
//       updated_at: Date.now(),
//     });

//     return { status: "playing", currentTurn: nextTurnNumber };
//   },
// });

// // Reset game (owner only)
// export const resetGame = mutation({
//   args: {
//     roomCode: v.string(),
//     userToken: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const user = await getUserFromToken(ctx, args.userToken);
//     if (!user.success || !user.id) throw new Error("User not found");

//     const room = await ctx.db
//       .query("rooms")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     if (!room) throw new Error("Room not found");

//     // Only owner can reset
//     if (room.ownerId !== user.id) {
//       throw new Error("Only room owner can reset the game");
//     }

//     const gameState = await ctx.db
//       .query("scribble_game_state")
//       .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
//       .unique();

//     if (gameState) {
//       await ctx.db.delete(gameState._id);
//     }

//     return { success: true };
//   },
// });
