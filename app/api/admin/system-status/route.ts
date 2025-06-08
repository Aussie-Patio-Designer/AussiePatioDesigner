import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Test database connection
    await sql`SELECT 1`

    // Check if agents table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agents'
      )
    `

    const tableExists = tableCheck[0].exists

    let agentCount = 0
    let sampleAgents = []

    if (tableExists) {
      const countResult = await sql`SELECT COUNT(*) FROM agents`
      agentCount = Number.parseInt(countResult[0].count)

      sampleAgents = await sql`
        SELECT id, company_name, email, url_slug, status 
        FROM agents 
        ORDER BY created_at DESC 
        LIMIT 3
      `
    }

    return NextResponse.json({
      success: true,
      database: {
        connection: "✅ Connected",
        agents_table: tableExists ? "✅ Exists" : "❌ Missing",
        agent_count: agentCount,
      },
      sample_agents: sampleAgents,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("System status check failed:", error)
    return NextResponse.json(
      {
        success: false,
        database: {
          connection: "❌ Failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
