import Redis from "ioredis";

const VALKEY_URL = process.env.VALKEY_URL;
const isDevEnv = process.env.NEXT_PUBLIC_ENV === "dev";
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

async function getItem(key: string) {
  if (isDevEnv) {
    console.log(`----- Hitting cache for ${key} -------`);
  }
  return await valkeyClient.get(key);
}

async function setItem(key: string, value: string, ttl?: number) {
  if (isDevEnv) {
    console.log(`----- Setting cache for ${key} -------`);
  }
  if (ttl) {
    return await valkeyClient.setex(key, ttl, value);
  }
  return await valkeyClient.set(key, value);
}

async function deleteItem(key: string) {
  if (isDevEnv) {
    console.log(`----- Deleting cache for ${key} -------`);
  }
  const res = await valkeyClient.del(key);
  return res === 1 ? "true" : "false";
}

export { valkeyClient, getItem, setItem, deleteItem };
