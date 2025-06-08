import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== FETCHING AGENTS ===")

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
    console.log("=== CREATING NEW AGENT ===")

    // Parse request body
    let data
    try {
      data = await request.json()
      console.log("Received data:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError)
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = ["company_name", "contact_name", "email", "url_slug"]
    const missingFields = requiredFields.filter((field) => !data[field]?.trim())

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
          received_data: data,
        },
        { status: 400 },
      )
    }

    // Test database connection first
    console.log("Testing database connection...")
    try {
      await sql`SELECT 1`
      console.log("✅ Database connection successful")
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 500 },
      )
    }

    // Check for existing email/slug
    console.log("Checking for existing email/slug...")
    try {
      const existing = await sql`
        SELECT id, email, url_slug FROM agents 
        WHERE email = ${data.email} OR url_slug = ${data.url_slug}
      `

      if (existing.length > 0) {
        const existingAgent = existing[0]
        const conflict = existingAgent.email === data.email ? "email" : "url_slug"
        console.error(`Conflict found: ${conflict} already exists for agent ID ${existingAgent.id}`)
        return NextResponse.json(
          {
            success: false,
            error: `This ${conflict} is already in use by another agent`,
            conflicting_agent: existingAgent,
          },
          { status: 400 },
        )
      }
      console.log("✅ No conflicts found")
    } catch (checkError) {
      console.error("❌ Error checking for existing agents:", checkError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check for existing agents",
          details: checkError instanceof Error ? checkError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // Insert new agent
    console.log("Inserting new agent...")
    try {
      const insertData = {
        company_name: data.company_name.trim(),
        contact_name: data.contact_name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        website: data.website?.trim() || null,
        logo_url: data.logo_url?.trim() || null,
        url_slug: data.url_slug.trim().toLowerCase(),
        subscription_type: data.subscription_type || "basic",
      }

      console.log("Insert data:", JSON.stringify(insertData, null, 2))

      const result = await sql`
        INSERT INTO agents (
          company_name, contact_name, email, phone, website,
          logo_url, url_slug, subscription_type, status
        ) VALUES (
          ${insertData.company_name}, 
          ${insertData.contact_name}, 
          ${insertData.email},
          ${insertData.phone}, 
          ${insertData.website}, 
          ${insertData.logo_url},
          ${insertData.url_slug}, 
          ${insertData.subscription_type}, 
          'active'
        )
        RETURNING id, company_name, url_slug, email, created_at
      `

      if (result.length === 0) {
        console.error("❌ No result returned from INSERT")
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create agent - no data returned from database",
          },
          { status: 500 },
        )
      }

      const agent = result[0]
      console.log("✅ Agent created successfully:", agent)

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
    } catch (insertError) {
      console.error("❌ Error inserting agent:", insertError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to insert agent into database",
          details: insertError instanceof Error ? insertError.message : "Unknown error",
          sql_error: insertError instanceof Error ? insertError.stack : undefined,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Unexpected error creating agent:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
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
