import { NextResponse } from "next/server"
import { getInquiries, getInquiryStats, createInquiry } from "@/lib/database"
import { getEnvConfig } from "@/lib/env"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Check if database is configured
    const config = getEnvConfig()
    if (!config.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection string is not configured",
        },
        { status: 500 },
      )
    }

    // Test getting stats
    const statsResult = await getInquiryStats()
    console.log("Stats result:", statsResult)

    // Test getting inquiries
    const inquiriesResult = await getInquiries(1, 5)
    console.log("Inquiries result:", inquiriesResult)

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      stats: statsResult.success ? statsResult.stats : null,
      inquiries: inquiriesResult.success ? inquiriesResult.inquiries : null,
      sampleCount: inquiriesResult.success ? inquiriesResult.inquiries?.length : 0,
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    // Check if database is configured
    const config = getEnvConfig()
    if (!config.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection string is not configured",
        },
        { status: 500 },
      )
    }

    // Test creating a new inquiry
    const testInquiry = {
      customer_name: "Test Customer",
      customer_email: "test@example.com",
      site_address: "123 Test Street, Test City QLD 4000",
      roof_type: "Gable",
      roof_cladding: "Insulated Panel",
      roof_pitch: 15,
      length: 3000,
      width: 3000,
      height: 2400,
      has_overhang: false,
      overhang_sides: [],
      overhang_size: 0,
      roof_color: "SURFMIST / BASALT",
      post_beam_color: "MONUMENT",
      status: "new" as const,
    }

    const createResult = await createInquiry(testInquiry)
    console.log("Create result:", createResult)

    return NextResponse.json({
      success: true,
      message: "Test inquiry created successfully!",
      inquiryId: createResult.id,
    })
  } catch (error) {
    console.error("Database create test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
