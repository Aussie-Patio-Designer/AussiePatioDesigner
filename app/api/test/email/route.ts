import { NextResponse } from "next/server"
import { getEnvConfig } from "@/lib/env"

export async function GET() {
  try {
    const config = getEnvConfig()

    if (!config.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        message: "Email system not configured",
        details: "RESEND_API_KEY environment variable is missing",
      })
    }

    // Test if we can import Resend
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(config.RESEND_API_KEY)

      return NextResponse.json({
        success: true,
        message: "Email system is configured",
        details: "Resend API key is available and library can be imported",
      })
    } catch (importError) {
      return NextResponse.json({
        success: false,
        message: "Email system configuration error",
        details: "Failed to import Resend library",
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error testing email system",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
