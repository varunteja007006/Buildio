import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema";
import "dotenv/config";

const DATABASE_URL = `${process.env.DATABASE_URL ?? ""}`;

if (!DATABASE_URL) {
  throw new Error("Database URL not found");
}

const db = drizzle(DATABASE_URL, {
  schema,
  casing: "snake_case",
});

export { db, schema };
