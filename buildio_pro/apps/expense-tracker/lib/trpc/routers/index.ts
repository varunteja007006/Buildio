import { createTRPCRouter } from "../init";
import { contactUsRouter } from "./contact-us.router";

export const appRouter = createTRPCRouter({
  contactUs: contactUsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
