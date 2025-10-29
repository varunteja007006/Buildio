import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export { dbSchema } from "./schema";
export { zodSchema } from "./zod-schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Unable to find the DB connection string");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle({ client: pool, casing: "snake_case" });

export { db };
