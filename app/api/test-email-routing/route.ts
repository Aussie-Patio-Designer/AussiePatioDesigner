import { type NextRequest, NextResponse } from "next/server"
import { routeInquiryEmail, validateEmailRouting } from "@/lib/agent-email-routing"

export async function POST(request: NextRequest) {
  try {
    const { agentSlug, sourceUrl, agentData } = await request.json()

    console.log("🧪 Testing email routing with:", { agentSlug, sourceUrl, agentData })

    // Validate email configuration
    const validation = validateEmailRouting()

    // Test the routing
    const routingResult = await routeInquiryEmail(agentSlug, sourceUrl, agentData)

    return NextResponse.json({
      success: true,
      validation,
      routing: routingResult,
      environment: {
        SALES_EMAIL_1: process.env.SALES_EMAIL_1 || "Not set",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error testing email routing:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
