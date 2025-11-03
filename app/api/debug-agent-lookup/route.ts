import { type NextRequest, NextResponse } from "next/server"
import { resolveSqlClient } from "@/lib/api-db"

export async function POST(request: NextRequest) {
  const resolvedClient = resolveSqlClient("debugging agent lookup")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  try {
    const { slug } = await request.json()

    console.log("🔍 DEBUGGING AGENT LOOKUP FOR:", slug)

    const { sql } = resolvedClient

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'agents'
      );
    `

    if (!tableCheck[0]?.exists) {
      return NextResponse.json({
        error: "Agents table does not exist",
        tableExists: false,
      })
    }

    // Get all agents for comparison
    const allAgents = await sql`
      SELECT id, company_name, email, url_slug, status, created_at 
      FROM agents 
      ORDER BY id
    `

    // Look for exact match
    const exactMatch = await sql`
      SELECT * FROM agents 
      WHERE url_slug = ${slug}
    `

    // Look for active exact match
    const activeMatch = await sql`
      SELECT * FROM agents 
      WHERE url_slug = ${slug} 
      AND status = 'active'
    `

    // Look for similar matches
    const similarMatches = await sql`
      SELECT * FROM agents 
      WHERE lower(url_slug) LIKE ${`%${slug.toLowerCase()}%`}
      OR lower(company_name) LIKE ${`%${slug.toLowerCase()}%`}
    `

    const result = {
      searchSlug: slug,
      tableExists: true,
      totalAgents: allAgents.length,
      allAgents,
      exactMatch: exactMatch.length > 0 ? exactMatch[0] : null,
      activeMatch: activeMatch.length > 0 ? activeMatch[0] : null,
      similarMatches,
      analysis: {
        hasExactMatch: exactMatch.length > 0,
        hasActiveMatch: activeMatch.length > 0,
        exactMatchStatus: exactMatch.length > 0 ? exactMatch[0].status : "N/A",
        recommendedAction:
          activeMatch.length > 0
            ? "Agent found and active - should work"
            : exactMatch.length > 0
              ? `Agent found but status is '${exactMatch[0].status}' - needs to be 'active'`
              : "No agent found - will use fallback email",
      },
    }

    console.log("🎯 AGENT LOOKUP RESULT:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Agent lookup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
