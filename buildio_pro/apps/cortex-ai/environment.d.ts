declare namespace NodeJS {
  interface ProcessEnv {
    // PostgreSQL
    DATABASE_URL: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;

    // Valkey (Redis-compatible cache)
    VALKEY_URL: string;

    // Vercel AI Gateway
    AI_GATEWAY_API_KEY: string;
    OPENAI_API_KEY?: string;
    VERCEL_OIDC_TOKEN?: string;

    // Chat guardrail (defaults to enabled)
    CHAT_GUARDRAIL_ENABLED?: string;
    CHAT_GUARDRAIL_MODEL?: string;

    // Better Auth
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    NEXT_PUBLIC_APP_URL: string;
    TRUSTED_ORIGINS?: string;

    // Google OAuth
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    // UploadThing
    UPLOADTHING_TOKEN: string;

    // MinIO (S3-compatible object storage, connector file uploads)
    S3_ENDPOINT?: string;
    S3_ACCESS_KEY?: string;
    S3_SECRET_KEY?: string;
    S3_BUCKET?: string;
    S3_USE_SSL?: string;

    // Connector dev servers (docker-compose defaults apply)
    CONNECTOR_POSTGRES_USER?: string;
    CONNECTOR_POSTGRES_PASSWORD?: string;
    CONNECTOR_POSTGRES_DB?: string;
    MONGO_USER?: string;
    MONGO_PASSWORD?: string;
    MYSQL_USER?: string;
    MYSQL_PASSWORD?: string;
    MYSQL_ROOT_PASSWORD?: string;

    // Next.js
    NODE_ENV: "development" | "production" | "test";
  }
}
