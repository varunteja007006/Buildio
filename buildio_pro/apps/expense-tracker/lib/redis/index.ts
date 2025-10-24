import Redis from "ioredis";

const VALKEY_URL = process.env.VALKEY_URL;

// Type definition for the client we will export
export type ValkeyClient = Redis;

const valkeyClient: Redis = VALKEY_URL
  ? new Redis(VALKEY_URL)
  : new Redis({
      host: process.env.VALKEY_HOST || "localhost",
      port: Number.parseInt(process.env.VALKEY_PORT || "6379", 10),
    });

valkeyClient.on("connect", () => {
  console.log("Valkey Client connected successfully.");
});

valkeyClient.on("error", (err) => {
  console.error("Valkey Client Error:", err);
});

export { valkeyClient };
