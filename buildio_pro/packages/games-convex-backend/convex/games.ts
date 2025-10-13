import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Auth } from "convex/server";

// Optional: function to get user identity if needed
export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all games
export const getAllGames = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

// Get a single game by ID
export const getGameById = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, { gameId }) => {
    return await ctx.db.get(gameId);
  },
});

// Create a new game
export const createGame = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    return await ctx.db.insert("games", {
      name,
      createdAt: Date.now(),
    });
  },
});

// Update game name
export const updateGameName = mutation({
  args: {
    gameId: v.id("games"),
    name: v.string(),
  },
  handler: async (ctx, { gameId, name }) => {
    await ctx.db.patch(gameId, { name });
  },
});

// Delete a game
export const deleteGame = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, { gameId }) => {
    await ctx.db.delete(gameId);
  },
});
