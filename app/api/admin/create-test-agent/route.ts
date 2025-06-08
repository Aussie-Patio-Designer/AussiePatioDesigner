import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("Creating test agent...")
    const sql = neon(process.env.DATABASE_URL!)

    // Generate unique values
    const timestamp = Date.now()
    const testAgent = {
      company_name: `Test Company ${timestamp}`,
      contact_name: `Test Contact ${timestamp}`,
      email: `test${timestamp}@example.com`,
      phone: "+61 400 000 000",
      website: "https://example.com",
      logo_url: null,
      url_slug: `test-company-${timestamp}`,
      subscription_type: "basic",
    }

    console.log("Test agent data:", testAgent)

    // Insert the agent
    const result = await sql`
      INSERT INTO agents (
        company_name, contact_name, email, phone, website,
        logo_url, url_slug, subscription_type, status
      ) VALUES (
        ${testAgent.company_name},
        ${testAgent.contact_name},
        ${testAgent.email},
        ${testAgent.phone},
        ${testAgent.website},
        ${testAgent.logo_url},
        ${testAgent.url_slug},
        ${testAgent.subscription_type},
        'active'
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: "Test agent created successfully",
      agent: result[0],
    })
  } catch (error) {
    console.error("Error creating test agent:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    })
  }
}
