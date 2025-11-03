import { NextResponse } from "next/server"
import { resolveSqlClient } from "@/lib/api-db"

export async function GET() {
  const resolvedClient = resolveSqlClient("listing agents")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  try {
    console.log("Listing agents...")
    const { sql } = resolvedClient

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agents'
      )
    `

    if (!tableExists[0].exists) {
      return NextResponse.json({
        success: false,
        error: "Agents table does not exist",
        suggestion: "Visit /api/admin/create-agents-table to create the table",
      })
    }

    // Get all agents
    const agents = await sql`
      SELECT * FROM agents ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      count: agents.length,
      agents,
    })
  } catch (error) {
    console.error("Error listing agents:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
