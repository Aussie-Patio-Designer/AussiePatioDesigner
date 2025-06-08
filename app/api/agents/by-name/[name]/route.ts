import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const agentName = params.name

    // Find agent by name (case insensitive)
    const result = await sql`
      SELECT * FROM agents 
      WHERE LOWER(name) = LOWER(${agentName}) 
      AND status = 'active'
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      agent: result[0],
    })
  } catch (error) {
    console.error("Error fetching agent by name:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch agent" }, { status: 500 })
  }
}
