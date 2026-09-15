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

    // Next.js
    NODE_ENV: "development" | "production" | "test";
  }
}
