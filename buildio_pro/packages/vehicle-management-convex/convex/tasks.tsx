import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const res = await ctx.db.query("tasks").collect();
    return res;
  },
});

export const getHello = query({
  args: {},
  handler: async (_ctx) => {
    const res = "Hello";
    return res;
  },
});
