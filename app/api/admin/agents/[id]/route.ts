import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const agentId = params.id

    // Update agent
    const result = await sql`
      UPDATE agents SET
        company_name = ${data.company_name},
        contact_name = ${data.contact_name},
        contact_email = ${data.contact_email},
        sales_email = ${data.sales_email},
        phone = ${data.phone || null},
        website = ${data.website || null},
        commission_rate = ${data.commission_rate || null},
        status = ${data.status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${agentId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      agent: result[0],
      message: "Agent updated successfully",
    })
  } catch (error) {
    console.error("Error updating agent:", error)
    return NextResponse.json({ success: false, error: "Failed to update agent" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id

    // Check if agent has any inquiries
    const inquiryCount = await sql`
      SELECT COUNT(*) as count FROM gazebo_inquiries WHERE agent_id = ${agentId}
    `

    if (Number(inquiryCount[0]?.count) > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete agent with existing inquiries" },
        { status: 400 },
      )
    }

    // Delete agent
    const result = await sql`
      DELETE FROM agents WHERE id = ${agentId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting agent:", error)
    return NextResponse.json({ success: false, error: "Failed to delete agent" }, { status: 500 })
  }
}
