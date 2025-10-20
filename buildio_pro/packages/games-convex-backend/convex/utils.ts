import type { QueryCtx } from "./_generated/server";

export const getUserFromToken = async (ctx: QueryCtx, token: string) => {
  const user = await ctx.db
    .query("users")
    .withIndex("by_user_token", (q) => q.eq("user_token", token))
    .unique();
  if (!user) {
    return {
      success: false,
      message: "User not found.",
      isFound: false,
    };
  }
  return {
    success: true,
    id: user._id,
    username: user.username,
    message: "User found.",
    isFound: true,
  };
};
