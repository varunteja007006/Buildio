import { createTRPCRouter } from "../init";
import { contactUsRouter } from "./contact-us.router";
import { healthRouter } from "./health.router";
import { userDetailsRouter } from "./user-details.router";

export const appRouter = createTRPCRouter({
  contactUs: contactUsRouter,
  health: healthRouter,
  userDetails: userDetailsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
