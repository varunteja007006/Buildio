import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error("Unable to find the DB connection string");
}

const pool = new Pool({
	connectionString: DATABASE_URL,
});

pool.on("connect", async (client) => {
	await client.query("CREATE EXTENSION IF NOT EXISTS vector");
});

export const db = drizzle({ client: pool });
