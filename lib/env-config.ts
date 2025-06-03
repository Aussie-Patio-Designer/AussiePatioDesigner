/**
 * Centralized environment configuration
 */

export interface EnvConfig {
  // Database
  DATABASE_URL: string

  // Email
  RESEND_API_KEY: string

  // Storage
  BLOB_READ_WRITE_TOKEN: string

  // Admin
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string

  // Deployment
  IS_PRODUCTION: boolean
}

export function getEnvConfig(): EnvConfig {
  // Determine database URL from various possible env vars
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || ""

  return {
    DATABASE_URL: databaseUrl,
    RESEND_API_KEY: process.env.RESEND_API_KEY || "",
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || "",
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
    IS_PRODUCTION: process.env.NODE_ENV === "production",
  }
}

/**
 * Check if a specific environment variable is configured
 */
export function hasEnvVariable(key: keyof EnvConfig): boolean {
  const config = getEnvConfig()
  return !!config[key]
}
