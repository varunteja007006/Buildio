import { createTRPCRouter } from "../init";
import { contactUsRouter } from "./contact-us.router";
import { healthRouter } from "./health.router";

export const appRouter = createTRPCRouter({
  contactUs: contactUsRouter,
  health: healthRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
