import { z } from "zod";

export const CONNECTION_TYPES = [
  "postgres",
  "mongodb",
  "mysql",
  "sqlite",
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export const connectionTypeSchema = z.enum(CONNECTION_TYPES);

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

const hostSchema = nonEmpty(255).regex(
  /^[a-zA-Z0-9._-]+$/,
  "Host must be a hostname, IP, or unix socket path segment",
);
const portSchema = z.coerce.number().int().min(1).max(65535);

const serverFields = {
  host: hostSchema,
  port: portSchema,
  database: nonEmpty(128),
  username: nonEmpty(128),
  password: z.string().max(256),
};

const sqliteFields = {
  sqliteFileKey: nonEmpty(512),
  sqliteFileName: nonEmpty(255),
  sqliteFileSizeBytes: z.coerce.number().int().min(0).max(50 * 1024 * 1024),
};

export const connectionTestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("postgres"), ...serverFields }),
  z.object({ type: z.literal("mongodb"), ...serverFields }),
  z.object({ type: z.literal("mysql"), ...serverFields }),
  z.object({ type: z.literal("sqlite"), ...sqliteFields }),
]);

export const connectionCreateSchema = z.object({
  name: nonEmpty(128),
  ...serverFields,
});

export const connectionUpdateSchema = z.object({
  name: nonEmpty(128).optional(),
  host: hostSchema.optional(),
  port: portSchema.optional(),
  database: nonEmpty(128).optional(),
  username: nonEmpty(128).optional(),
  password: z.string().max(256).optional(),
});

export type ConnectionTestInput = z.infer<typeof connectionTestSchema>;
export type ConnectionCreateInput = z.infer<typeof connectionCreateSchema>;
export type ConnectionUpdateInput = z.infer<typeof connectionUpdateSchema>;
