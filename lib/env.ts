/**
 * Environment variable configuration with validation
 */

export interface EnvConfig {
  DATABASE_URL: string
  RESEND_API_KEY: string
  BLOB_READ_WRITE_TOKEN: string
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
}

export function getEnvConfig(): EnvConfig {
  console.log("Checking environment variables...")

  // Log what we have (without exposing sensitive values)
  console.log("Environment check:", {
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
  })

  // Validate critical environment variables
  const missingVars = []

  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    missingVars.push("DATABASE_URL or POSTGRES_URL")
  }

  if (!process.env.ADMIN_USERNAME) {
    missingVars.push("ADMIN_USERNAME")
  }

  if (!process.env.ADMIN_PASSWORD) {
    missingVars.push("ADMIN_PASSWORD")
  }

  // Log warnings but don't block execution for non-critical vars
  if (!process.env.RESEND_API_KEY) {
    console.warn("Warning: Missing RESEND_API_KEY environment variable - email functionality will be limited")
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("Warning: Missing BLOB_READ_WRITE_TOKEN environment variable - screenshot uploads will be disabled")
  }

  // If critical variables are missing, log a more severe warning
  if (missingVars.length > 0) {
    console.error(`Critical environment variables missing: ${missingVars.join(", ")}`)
    console.error("Please check your Vercel environment variables configuration")
  }

  // Return config with fallbacks where appropriate
  return {
    DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
    RESEND_API_KEY: process.env.RESEND_API_KEY || "",
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || "",
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  }
}

/**
 * Check if a specific environment variable is configured
 */
export function hasEnvVariable(key: keyof EnvConfig): boolean {
  const config = getEnvConfig()
  return !!config[key]
}
