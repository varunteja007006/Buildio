import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const DATABASE_URL = `${process.env.DATABASE_URL ?? ""}${process.env.DATABASE_NAME ?? ""}`;

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/drizzle/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
