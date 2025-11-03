import { NextResponse } from "next/server"
import { resolveSqlClient } from "@/lib/api-db"

export async function GET(request: Request) {
  const resolvedClient = resolveSqlClient("debugging agent data")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug") || "lockyersheds"

    console.log(`🔍 Debugging agent with slug: "${slug}"`)

    const { sql } = resolvedClient

    // Check if the agents table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'agents'
      );
    `

    const agentsTableExists = tableCheck[0]?.exists || false

    if (!agentsTableExists) {
      return NextResponse.json({
        success: false,
        error: "Agents table does not exist in database",
        tableCheck,
      })
    }

    // Get all agents to see what's available
    const allAgents = await sql`SELECT id, url_slug, company_name, email, status FROM agents;`

    // Look for the specific agent
    const agent = await sql`
      SELECT * FROM agents 
      WHERE url_slug = ${slug}
    `

    // Check if there are any agents with similar slugs (case insensitive)
    const similarAgents = await sql`
      SELECT id, url_slug, company_name, email, status 
      FROM agents 
      WHERE lower(url_slug) LIKE ${`%${slug.toLowerCase()}%`}
    `

    return NextResponse.json({
      success: true,
      agentsTableExists,
      agentCount: allAgents.length,
      allAgents,
      requestedSlug: slug,
      exactMatch: agent.length > 0 ? agent[0] : null,
      similarMatches: similarAgents,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error debugging agent:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
