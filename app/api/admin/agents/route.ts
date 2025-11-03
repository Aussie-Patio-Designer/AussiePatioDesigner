import { type NextRequest, NextResponse } from "next/server"
import { resolveSqlClient } from "@/lib/api-db"
import type { SqlClient } from "@/lib/neon-client"

// Function to ensure the agents table exists
async function ensureAgentsTableExists(sql: SqlClient) {
  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agents'
      )
    `

    const tableExists = tableCheck[0].exists

    if (!tableExists) {
      console.log("Agents table doesn't exist. Creating it now...")

      // Create the table
      await sql`
        CREATE TABLE agents (
          id SERIAL PRIMARY KEY,
          company_name VARCHAR(255) NOT NULL,
          contact_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          website VARCHAR(255),
          logo_url TEXT,
          url_slug VARCHAR(100) UNIQUE NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          subscription_type VARCHAR(20) DEFAULT 'basic',
          subscription_expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      console.log("Agents table created successfully")
      return true
    }

    return false
  } catch (error) {
    console.error("Error checking/creating agents table:", error)
    throw error
  }
}

export async function GET() {
  const resolvedClient = resolveSqlClient("fetching agents")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  const { sql } = resolvedClient

  try {
    // Ensure table exists before querying
    await ensureAgentsTableExists(sql)

    const agents = await sql`
      SELECT 
        id, company_name, contact_name, email, phone, website, 
        logo_url, url_slug, status, subscription_type, 
        subscription_expires_at, created_at, updated_at
      FROM agents 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      agents,
      count: agents.length,
    })
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
  const resolvedClient = resolveSqlClient("creating agent")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  const { sql } = resolvedClient

  try {
    // Ensure table exists before inserting
    await ensureAgentsTableExists(sql)

    const data = await request.json()

    // Validate required fields
    const requiredFields = ["company_name", "contact_name", "email", "url_slug"]
    const missingFields = requiredFields.filter((field) => !data[field]?.trim())

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Clean and prepare data
    const cleanData = {
      company_name: data.company_name.trim(),
      contact_name: data.contact_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      website: data.website?.trim() || null,
      logo_url: data.logo_url?.trim() || null,
      url_slug: data.url_slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-"),
      subscription_type: data.subscription_type || "basic",
    }

    // Insert agent
    const result = await sql`
      INSERT INTO agents (
        company_name, contact_name, email, phone, website,
        logo_url, url_slug, subscription_type, status
      ) VALUES (
        ${cleanData.company_name}, 
        ${cleanData.contact_name}, 
        ${cleanData.email},
        ${cleanData.phone}, 
        ${cleanData.website}, 
        ${cleanData.logo_url},
        ${cleanData.url_slug}, 
        ${cleanData.subscription_type}, 
        'active'
      )
      RETURNING id, company_name, url_slug, email, created_at
    `

    const agent = result[0]
    return NextResponse.json({
      success: true,
      message: "Agent created successfully",
      agent: {
        ...agent,
        customer_url: `https://aussie-patio-designer.vercel.app/${agent.url_slug}`,
      },
    })
  } catch (error) {
    console.error("Error creating agent:", error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key") && error.message.includes("email")) {
        return NextResponse.json({ success: false, error: "This email address is already registered" }, { status: 400 })
      }
      if (error.message.includes("duplicate key") && error.message.includes("url_slug")) {
        return NextResponse.json({ success: false, error: "This URL slug is already taken" }, { status: 400 })
      }
    }

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
  const resolvedClient = resolveSqlClient("updating agent")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  const { sql } = resolvedClient

  try {
    // Ensure table exists
    await ensureAgentsTableExists(sql)

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
  const resolvedClient = resolveSqlClient("deactivating agent")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  const { sql } = resolvedClient

  try {
    // Ensure table exists
    await ensureAgentsTableExists(sql)

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
