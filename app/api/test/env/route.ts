import { NextResponse } from "next/server"
import { getEnvConfig, hasEnvVariable } from "@/lib/env"

export async function GET() {
  try {
    const config = getEnvConfig()
    const checks = {
      DATABASE_URL: hasEnvVariable("DATABASE_URL"),
      RESEND_API_KEY: hasEnvVariable("RESEND_API_KEY"),
      BLOB_READ_WRITE_TOKEN: hasEnvVariable("BLOB_READ_WRITE_TOKEN"),
      ADMIN_USERNAME: hasEnvVariable("ADMIN_USERNAME"),
      ADMIN_PASSWORD: hasEnvVariable("ADMIN_PASSWORD"),
    }

    const missingVars = Object.entries(checks)
      .filter(([_, hasVar]) => !hasVar)
      .map(([varName]) => varName)

    const criticalMissing = missingVars.filter((varName) =>
      ["DATABASE_URL", "ADMIN_USERNAME", "ADMIN_PASSWORD"].includes(varName),
    )

    return NextResponse.json({
      success: criticalMissing.length === 0,
      message:
        criticalMissing.length === 0
          ? "All critical environment variables are configured"
          : `Missing critical variables: ${criticalMissing.join(", ")}`,
      details: `Configured: ${Object.keys(checks).length - missingVars.length}/${Object.keys(checks).length}. Missing: ${missingVars.join(", ") || "none"}`,
      checks,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error checking environment variables",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
