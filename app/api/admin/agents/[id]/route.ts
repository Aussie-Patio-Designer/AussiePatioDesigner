import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = Number.parseInt(params.id)
    if (isNaN(agentId)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 })
    }

    const body = await request.json()
    const { company_name, contact_name, email, phone, website_url, logo_url, url_slug, status, notes } = body

    // Validate required fields
    if (!company_name || !contact_name || !email || !phone || !url_slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate URL slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(url_slug)) {
      return NextResponse.json(
        { error: "URL slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 },
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Check if URL slug is already taken by another agent
    const existingAgent = await sql`
      SELECT id FROM agents 
      WHERE url_slug = ${url_slug} 
      AND id != ${agentId}
      LIMIT 1
    `

    if (existingAgent.length > 0) {
      return NextResponse.json({ error: "URL slug is already taken" }, { status: 400 })
    }

    // Update the agent - using correct column names from database
    const result = await sql`
      UPDATE agents 
      SET 
        company_name = ${company_name},
        contact_name = ${contact_name},
        email = ${email},
        phone = ${phone},
        website = ${website_url || null},
        logo_url = ${logo_url || null},
        url_slug = ${url_slug},
        status = ${status},
        updated_at = NOW()
      WHERE id = ${agentId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      agent: result[0],
    })
  } catch (error) {
    console.error("Error updating agent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = Number.parseInt(params.id)
    if (isNaN(agentId)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Start a transaction to ensure data consistency
    try {
      // First, get agent details for confirmation
      const agentDetails = await sql`
        SELECT company_name, email FROM agents 
        WHERE id = ${agentId}
        LIMIT 1
      `

      if (agentDetails.length === 0) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 })
      }

      const agent = agentDetails[0]

      // Count inquiries that will be deleted
      const inquiryCount = await sql`
        SELECT COUNT(*) as count 
        FROM gazebo_inquiries 
        WHERE agent_email = ${agent.email}
      `

      // Delete all inquiries associated with this agent's email
      const deletedInquiries = await sql`
        DELETE FROM gazebo_inquiries 
        WHERE agent_email = ${agent.email}
        RETURNING id
      `

      // Delete the agent
      const deletedAgent = await sql`
        DELETE FROM agents 
        WHERE id = ${agentId}
        RETURNING id, company_name
      `

      return NextResponse.json({
        success: true,
        message: `Agent "${agent.company_name}" deleted successfully`,
        details: {
          agent_deleted: deletedAgent.length > 0,
          inquiries_deleted: deletedInquiries.length,
          total_inquiries_count: Number(inquiryCount[0]?.count || 0),
        },
      })
    } catch (transactionError) {
      console.error("Transaction error:", transactionError)
      return NextResponse.json(
        {
          error: "Failed to delete agent and related data",
          details: transactionError instanceof Error ? transactionError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error deleting agent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
