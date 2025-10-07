import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const DATABASE_URL = `${process.env.DATABASE_URL ?? ""}`;

export default defineConfig({
  out: "./lib/drizzle/migration-scripts",
  schema: "./lib/drizzle/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
