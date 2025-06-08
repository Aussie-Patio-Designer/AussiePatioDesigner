import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching agents from database...")

    const agents = await sql`
      SELECT 
        id, company_name, contact_name, email, phone, website, 
        logo_url, url_slug, status, subscription_type, 
        subscription_expires_at, created_at, updated_at
      FROM agents 
      ORDER BY created_at DESC
    `

    console.log(`Found ${agents.length} agents`)
    return NextResponse.json({ success: true, agents })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch agents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new agent...")
    const data = await request.json()
    console.log("Agent data received:", data)

    // Validate required fields
    const requiredFields = ["company_name", "contact_name", "email", "url_slug"]
    const missingFields = requiredFields.filter((field) => !data[field]?.trim())

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Check if email or url_slug already exists
    console.log("Checking for existing email/slug...")
    const existing = await sql`
      SELECT id, email, url_slug FROM agents 
      WHERE email = ${data.email} OR url_slug = ${data.url_slug}
    `

    if (existing.length > 0) {
      const existingAgent = existing[0]
      const conflict = existingAgent.email === data.email ? "email" : "url_slug"
      console.error(`Conflict found: ${conflict} already exists`)
      return NextResponse.json(
        {
          success: false,
          error: `This ${conflict} is already in use by another agent`,
        },
        { status: 400 },
      )
    }

    // Insert new agent
    console.log("Inserting new agent into database...")
    const result = await sql`
      INSERT INTO agents (
        company_name, contact_name, email, phone, website,
        logo_url, url_slug, subscription_type, status
      ) VALUES (
        ${data.company_name}, 
        ${data.contact_name}, 
        ${data.email},
        ${data.phone || null}, 
        ${data.website || null}, 
        ${data.logo_url || null},
        ${data.url_slug}, 
        ${data.subscription_type || "basic"}, 
        'active'
      )
      RETURNING id, company_name, url_slug, email, created_at
    `

    if (result.length === 0) {
      console.error("No result returned from INSERT")
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create agent - no data returned",
        },
        { status: 500 },
      )
    }

    const agent = result[0]
    console.log("Agent created successfully:", agent)

    return NextResponse.json({
      success: true,
      message: "Agent added successfully",
      agent: {
        id: agent.id,
        company_name: agent.company_name,
        url_slug: agent.url_slug,
        email: agent.email,
        customer_url: `https://aussie-patio-designer.vercel.app/${agent.url_slug}`,
        created_at: agent.created_at,
      },
    })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create agent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Agent ID is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE agents SET
        company_name = ${updateData.company_name},
        contact_name = ${updateData.contact_name},
        email = ${updateData.email},
        phone = ${updateData.phone || null},
        website = ${updateData.website || null},
        logo_url = ${updateData.logo_url || null},
        url_slug = ${updateData.url_slug},
        subscription_type = ${updateData.subscription_type},
        status = ${updateData.status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, company_name, url_slug
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Agent updated successfully",
      agent: result[0],
    })
  } catch (error) {
    console.error("Error updating agent:", error)
    return NextResponse.json({ success: false, error: "Failed to update agent" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Agent ID is required" }, { status: 400 })
    }

    // Soft delete - set status to inactive instead of deleting
    const result = await sql`
      UPDATE agents SET 
        status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, company_name
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Agent deactivated successfully",
    })
  } catch (error) {
    console.error("Error deactivating agent:", error)
    return NextResponse.json({ success: false, error: "Failed to deactivate agent" }, { status: 500 })
  }
}
