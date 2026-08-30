import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db, dbSchema } from "@/lib/db";

import { emailResetPassword, emailVerification } from "./email/api";
import {
  deleteItem,
  getAndDeleteItem,
  getItem,
  incrementItem,
  setItem,
} from "./redis";

export const auth = betterAuth({
  // database config
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: dbSchema,
  }),
  // when a new user is created, seed their profile, preferences and settings
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { userProfile, userPreferences, userSettings } = dbSchema;

          await Promise.all([
            db.insert(userProfile).values({
              user_id: user.id,
              name: user.name || user.email.split("@")[0] || "User",
              image_url: user.image ?? null,
            }),
            db.insert(userPreferences).values({
              user_id: user.id,
            }),
            db.insert(userSettings).values({
              user_id: user.id,
            }),
          ]);
        },
      },
    },
  },
  // session config
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 24 * 60 * 60, // Cache duration in seconds
    },
  },
  // secondary storage
  secondaryStorage: {
    get: getItem,
    getAndDelete: getAndDeleteItem,
    increment: incrementItem,
    set: setItem,
    delete: deleteItem,
  },
  // email auth
  emailAndPassword: {
    enabled: process.env.ALLOW_EMAIL_LOGIN === "true",
    requireEmailVerification: process.env.SEND_EMAIL_VERIFICATION == "true",
    sendResetPassword: async ({ user, url, token }, request) => {
      await emailResetPassword({
        to: [user.email],
        subject: "Reset your password",
        url: `${url}`,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await emailVerification({
        to: [user.email],
        subject: "Verify your email address",
        url: `${url}`,
      });
    },
  },
  //...Providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
});
