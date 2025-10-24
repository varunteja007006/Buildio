import { betterAuth, Auth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, dbSchema } from "@/lib/db"; // your drizzle instance

export const auth: Auth = betterAuth({
  // database config
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: dbSchema,
  }),
  // session config
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 24 * 60 * 60, // Cache duration in seconds
    },
  },
  //...Providers
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
});
