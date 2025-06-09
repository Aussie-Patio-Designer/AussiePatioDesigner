import { NextResponse } from "next/server"
import { getAgentEmailStats } from "@/lib/agent-email-routing"

export async function GET() {
  try {
    const stats = await getAgentEmailStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching email routing stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch email routing statistics",
      },
      { status: 500 },
    )
  }
}
