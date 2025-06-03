import { NextResponse } from "next/server"
import { hasEnvVariable } from "@/lib/env"

export async function GET() {
  try {
    if (!hasEnvVariable("BLOB_READ_WRITE_TOKEN")) {
      return NextResponse.json({
        success: false,
        message: "Blob storage not configured",
        details: "BLOB_READ_WRITE_TOKEN environment variable is missing",
      })
    }

    // Test if we can import the blob library
    try {
      await import("@vercel/blob")

      return NextResponse.json({
        success: true,
        message: "Blob storage is configured",
        details: "Blob token is available and library can be imported",
      })
    } catch (importError) {
      return NextResponse.json({
        success: false,
        message: "Blob storage configuration error",
        details: "Failed to import @vercel/blob library",
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error testing blob storage",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
