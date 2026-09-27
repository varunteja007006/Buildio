import { Client } from "pg";

import type { ConnectionType } from "./validation";

const CONNECT_TIMEOUT_MS = 3000;
const TOTAL_TIMEOUT_MS = 5000;

export type ProbeResult = {
  ok: boolean;
  latencyMs?: number;
  error?: string;
};

const BLOCKED_HOST_PATTERNS = [
  "169.254.169.254",
  "metadata.google.internal",
];

export type ServerProbeConfig = {
  type: ConnectionType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};

export function isBlockedHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return BLOCKED_HOST_PATTERNS.some((blocked) => normalized === blocked);
}

async function probePostgres(
  config: ServerProbeConfig,
): Promise<ProbeResult> {
  if (isBlockedHost(config.host))
    return { ok: false, error: "This host is not allowed" };
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });
  const startedAt = Date.now();
  try {
    await client.connect();
    await client.query("SELECT 1");
    return { ok: true, latencyMs: Date.now() - startedAt };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function probeConnection(
  config: ServerProbeConfig,
): Promise<ProbeResult> {
  try {
    return await Promise.race([
      probePostgres(config),
      new Promise<ProbeResult>((_, reject) =>
        setTimeout(
          () => reject(new Error("Connection check timed out")),
          TOTAL_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
