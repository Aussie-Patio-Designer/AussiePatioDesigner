import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const agentResult = await sql`
      SELECT id, company_name, email, status, url_slug
      FROM agents 
      WHERE url_slug = ${slug}
      LIMIT 1
    `

    return NextResponse.json({
      success: true,
      slug,
      found: agentResult.length > 0,
      agent: agentResult[0] || null,
    })
  } catch (error) {
    console.error("Error looking up agent:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
