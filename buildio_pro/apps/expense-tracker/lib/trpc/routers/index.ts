import { createTRPCRouter } from "../init";
import { contactUsRouter } from "./contact-us.router";
import { healthRouter } from "./health.router";
import { userDetailsRouter } from "./user-details.router";
import { wishlistGroups } from "./user-wishlist";

export const appRouter = createTRPCRouter({
  contactUs: contactUsRouter,
  health: healthRouter,
  userDetails: userDetailsRouter,
  wishlistGroups: wishlistGroups
});

// export type definition of API
export type AppRouter = typeof appRouter;
