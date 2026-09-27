import { Client } from "pg";

import { isBlockedHost, type ServerProbeConfig } from "./probe";

const CONNECT_TIMEOUT_MS = 3000;
const TOTAL_TIMEOUT_MS = 8000;

export type ConnectorTable = {
  schema: string;
  name: string;
};

const EXCLUDED_SCHEMAS = ["pg_catalog", "information_schema"];

export async function listPostgresTables(
  config: ServerProbeConfig,
): Promise<ConnectorTable[]> {
  if (isBlockedHost(config.host))
    throw new Error("This host is not allowed");
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });
  try {
    await client.connect();
    const result = await client.query<{
      table_schema: string;
      table_name: string;
    }>(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ($1, $2) ORDER BY table_schema, table_name",
      EXCLUDED_SCHEMAS,
    );
    return result.rows.map((row) => ({
      schema: row.table_schema,
      name: row.table_name,
    }));
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function listConnectionTables(
  config: ServerProbeConfig,
): Promise<ConnectorTable[]> {
  return Promise.race([
    listPostgresTables(config),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Listing tables timed out")), TOTAL_TIMEOUT_MS),
    ),
  ]);
}
