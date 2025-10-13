import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }),

  rounds: defineTable({
    gameId: v.id("games"),
    name: v.string(),
    status: v.union(v.literal("started"), v.literal("completed")),
    ticketPrice: v.number(),
    createdAt: v.number(),
  }),

  goals: defineTable({
    roundId: v.id("rounds"),
    name: v.string(),
    percentage: v.number(),
  }),

  teams: defineTable({
    roundId: v.id("rounds"),
    name: v.string(),
    amountPaid: v.number(),
    paid: v.boolean(),
  }),

  winners: defineTable({
    goalId: v.id("goals"),
    teamId: v.id("teams"),
    settled: v.boolean(),
  }),
});
