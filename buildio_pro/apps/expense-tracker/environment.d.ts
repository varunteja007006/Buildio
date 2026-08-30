declare namespace NodeJS {
  interface ProcessEnv {
    // env
    NEXT_PUBLIC_ENV: "dev" | "prod"

    // app URL
    NEXT_PUBLIC_APP_URL: string

    // database - postgres
    DATABASE_URL: string

    // authentication - better auth
    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string

    // email sign-up/login
    ALLOW_EMAIL_LOGIN: string
    SEND_EMAIL_VERIFICATION: string

    // caching - valkey
    VALKEY_URL: string
    VALKEY_HOST?: string
    VALKEY_PORT?: string

    // auth providers
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string

    // email service - resend
    RESEND_API_KEY: string

    // object storage - minio (S3-compatible)
    S3_ENDPOINT: string
    S3_ACCESS_KEY: string
    S3_SECRET_KEY: string
    S3_BUCKET: string
    S3_USE_SSL: string

    // ai extraction - vercel ai gateway
    AI_GATEWAY_API_KEY?: string
    AI_GATEWAY_TEAM_ID_OR_SLUG?: string
    AI_EXTRACTION_MODEL?: string

    // Next.js
    NODE_ENV: "development" | "production" | "test"
  }
}
