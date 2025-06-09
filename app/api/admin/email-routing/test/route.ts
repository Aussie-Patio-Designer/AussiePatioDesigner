import { type NextRequest, NextResponse } from "next/server"
import { routeInquiryEmail } from "@/lib/agent-email-routing"

export async function POST(request: NextRequest) {
  try {
    const { agentSlug } = await request.json()

    if (!agentSlug) {
      return NextResponse.json({ success: false, error: "Agent slug is required" }, { status: 400 })
    }

    const routingResult = await routeInquiryEmail(agentSlug)

    return NextResponse.json({
      success: true,
      ...routingResult,
    })
  } catch (error) {
    console.error("Error testing email routing:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test email routing",
      },
      { status: 500 },
    )
  }
}
