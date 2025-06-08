import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get agents with their stats
    const agents = await sql`
      SELECT 
        a.*,
        COUNT(gi.id) as total_inquiries,
        COALESCE(SUM(gi.estimated_value), 0) as total_revenue
      FROM agents a
      LEFT JOIN gazebo_inquiries gi ON gi.agent_id = a.id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `

    return NextResponse.json({
      success: true,
      agents,
    })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.company_name || !data.contact_name || !data.contact_email || !data.sales_email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create agent
    const result = await sql`
      INSERT INTO agents (
        company_name, contact_name, contact_email, sales_email,
        phone, website, commission_rate, status
      ) VALUES (
        ${data.company_name}, ${data.contact_name}, ${data.contact_email}, ${data.sales_email},
        ${data.phone || null}, ${data.website || null}, ${data.commission_rate || null}, ${data.status || "active"}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      agent: result[0],
      message: "Agent created successfully",
    })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json({ success: false, error: "Failed to create agent" }, { status: 500 })
  }
}
