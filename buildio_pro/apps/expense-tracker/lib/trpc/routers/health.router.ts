import { createTRPCRouter, baseProcedure, protectedProcedure } from "../init";

export const healthRouter = createTRPCRouter({
  checkRouter: baseProcedure.query(async () => {
    const res = {
      status: "ok!",
      message: "Router working!!",
    };
    return res;
  }),
  checkProtectedRouter: protectedProcedure.query(async ({ ctx }) => {
    const res = {
      status: "ok!",
      message: "Protected Router working!!" + ` Hello, ${ctx.user.name}`,
    };
    return res;
  }),
});
