import { NextResponse } from "next/server"
import { resolveSqlClient } from "@/lib/api-db"

export async function GET(request: Request) {
  const resolvedClient = resolveSqlClient("testing agent system")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug") || "lockyersheds"

    console.log(`🧪 Testing agent system for slug: "${slug}"`)

    const { sql } = resolvedClient

    // 1. Check if agents table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'agents'
      );
    `

    if (!tableExists[0]?.exists) {
      return NextResponse.json({
        success: false,
        error: "Agents table does not exist",
        step: "table_check",
      })
    }

    // 2. Get all agents
    const allAgents = await sql`
      SELECT id, url_slug, company_name, email, status, created_at 
      FROM agents 
      ORDER BY created_at DESC
    `

    // 3. Find specific agent
    const targetAgent = await sql`
      SELECT * FROM agents 
      WHERE url_slug = ${slug} 
      AND status = 'active'
      LIMIT 1
    `

    // 4. Test URL parsing (simulate what happens in the API)
    const testUrl = `https://aussie-patio-designer.vercel.app/${slug}`
    const urlObj = new URL(testUrl)
    const pathSegments = urlObj.pathname.split("/").filter(Boolean)

    return NextResponse.json({
      success: true,
      data: {
        tableExists: tableExists[0]?.exists,
        totalAgents: allAgents.length,
        allAgents: allAgents.map((a) => ({
          id: a.id,
          slug: a.url_slug,
          company: a.company_name,
          email: a.email,
          status: a.status,
        })),
        searchSlug: slug,
        foundAgent: targetAgent.length > 0 ? targetAgent[0] : null,
        urlParsing: {
          testUrl,
          pathSegments,
          detectedSlug: pathSegments[0] || null,
          matches: pathSegments[0] === slug,
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Error testing agent system:", error)
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
