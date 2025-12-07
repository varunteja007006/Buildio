import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    user_token: v.string(),
    created_at: v.number(),
    last_active: v.optional(v.number()),
  }).index("by_user_token", ["user_token"]),

  rooms: defineTable({
    room_name: v.string(),
    room_code: v.string(),
    created_at: v.number(),
    ownerId: v.id("users"), // replaces inference from teams
  })
    .index("by_room_code", ["room_code"])
    .index("by_owner", ["ownerId"]),

  teams: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    created_at: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"]),

  stories: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("started"), v.literal("completed")),
    roomId: v.id("rooms"),
    created_at: v.number(),
    created_by: v.id("users"),
  })
    .index("by_room", ["roomId"])
    .index("by_room_status", ["roomId", "status"])
    .index("by_status", ["status"])
    .index("created_at", ["created_at"]),

  storyPoints: defineTable({
    userId: v.id("users"),
    storyId: v.id("stories"),
    story_point: v.optional(v.union(v.number(), v.string())), // flexible card deck
    created_at: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_user", ["userId"])
    .index("by_story_and_user", ["storyId", "userId"]),

  chats: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    message: v.string(),
    isGuess: v.optional(v.boolean()),
    created_at: v.number(),
  }).index("by_room", ["roomId"]),

  scribble_lines: defineTable({
    roomId: v.id("rooms"),
    playerId: v.id("users"),
    tool: v.string(), // "pen" | "eraser"
    points: v.array(v.number()), // [x1, y1, x2, y2, ...]
    strokeWidth: v.number(),
    strokeColor: v.string(),
    isComplete: v.boolean(), // false while drawing, true when mouse up
  }).index("by_room", ["roomId"]),

  scribble_games: defineTable({
    room_code: v.string(),
    rounds: v.number(),
    timer: v.number(), // seconds per turn
    list_of_words: v.array(v.string()),
    word_filters: v.optional(v.array(v.string())),
    score: v.record(v.string(), v.number()), // userId -> score
    created_at: v.number(),
  }).index("by_room_code", ["room_code"]),

  scribble_game_state: defineTable({
    room_code: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    currentTurn: v.number(), // 1 to totalTurns
    totalTurns: v.number(), // rounds × number of users
    currentWord: v.string(), // Current word to draw
    turnStartTime: v.number(), // Timestamp when current turn started
    turnDuration: v.number(), // Seconds per turn (from settings.timer)
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_room_code", ["room_code"]),
});
