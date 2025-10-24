import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error("URL not found")
}

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "lib/db/schema",
  
  dbCredentials: {
    url: DATABASE_URL,
  },

  introspect: {
    casing: "camel",
  },

  migrations: {
    prefix: "timestamp",
    table: "__drizzle_migrations__",
    schema: "public",
  },

  breakpoints: true,
  strict: true,
  verbose: true,
});
