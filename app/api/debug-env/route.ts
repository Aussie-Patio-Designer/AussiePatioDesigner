import { NextResponse } from "next/server"

export async function GET() {
  // Debug environment variables (without exposing sensitive values)
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,

    // Check if variables exist (boolean only)
    has_DATABASE_URL: !!process.env.DATABASE_URL,
    has_POSTGRES_URL: !!process.env.POSTGRES_URL,
    has_RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    has_BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    has_ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
    has_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,

    // Show first few characters of non-sensitive vars
    DATABASE_URL_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "NOT_SET",
    POSTGRES_URL_prefix: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 20) + "..." : "NOT_SET",

    // Count total environment variables
    total_env_vars: Object.keys(process.env).length,
  }

  return NextResponse.json({
    success: true,
    environment: envDebug,
    message: "Environment debug information",
  })
}
