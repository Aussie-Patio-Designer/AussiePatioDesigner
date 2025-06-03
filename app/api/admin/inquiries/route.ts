import { type NextRequest, NextResponse } from "next/server"
import { getInquiries, getInquiryStats } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || "1")
    const limit = Number(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "all"
    const action = searchParams.get("action")

    if (action === "stats") {
      const statsResult = await getInquiryStats()
      if (!statsResult.success) {
        return NextResponse.json({ error: statsResult.error }, { status: 500 })
      }
      return NextResponse.json(statsResult.stats)
    }

    const result = await getInquiries(page, limit, status)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      inquiries: result.inquiries,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error("Error in admin inquiries API:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
