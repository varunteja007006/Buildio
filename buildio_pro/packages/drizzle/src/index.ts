import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

dotenv.config({
  path: "../../.env",
  debug: true
});

const DATABASE_URL = process.env.DATABASE_URL ?? "";

if (!DATABASE_URL) {
  throw new Error("Database URL not found");
}

const db = drizzle(DATABASE_URL);

export { db };
