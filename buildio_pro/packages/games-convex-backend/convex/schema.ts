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

  scribble_lines: defineTable({
    roomId: v.id("rooms"),
    playerId: v.id("users"),
    tool: v.string(), // "pen" | "eraser"
    points: v.array(v.number()), // [x1, y1, x2, y2, ...]
    strokeWidth: v.number(),
    strokeColor: v.string(),
    isComplete: v.boolean(), // false while drawing, true when mouse up
  }).index("by_room", ["roomId"]),
});
