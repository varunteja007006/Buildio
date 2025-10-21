import Redis from "ioredis";

// Environment variable key for the Valkey connection URL
const VALKEY_URL = process.env.VALKEY_URL;

// Type definition for the client we will export
export type ValkeyClient = Redis;

// Valkey connection URL format is typically:
// redis://[username]:[password]@[host]:[port]/[db_number]
// Example: redis://:mysecretpassword@localhost:6379/0

let valkeyClient: Redis;

if (!VALKEY_URL) {
  console.warn(
    "VALKEY_URL environment variable is not set. Using a fallback connection (localhost:6379)."
  );
  valkeyClient = new Redis({
    host: process.env.VALKEY_HOST || "localhost",
    port: parseInt(process.env.VALKEY_PORT || "6379", 10),
  });
} else {
  valkeyClient = new Redis(VALKEY_URL);
}

valkeyClient.on("connect", () => {
  console.log("Valkey Client connected successfully.");
});

valkeyClient.on("error", (err) => {
  console.error("Valkey Client Error:", err);
});

export { valkeyClient };
