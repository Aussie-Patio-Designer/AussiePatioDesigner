import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    console.log("=== AGENT CREATION TEST START ===")

    // Step 1: Test database connection
    console.log("Step 1: Testing database connection...")
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")

    // Step 2: Check if agents table exists
    console.log("Step 2: Checking if agents table exists...")
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agents'
      )
    `
    console.log("Table exists:", tableCheck[0].exists)

    if (!tableCheck[0].exists) {
      console.log("Creating agents table...")
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
      console.log("✅ Agents table created")
    }

    // Step 3: Test simple insert
    console.log("Step 3: Testing agent insertion...")
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

    console.log("Inserting agent:", testAgent)

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

    console.log("✅ Agent created successfully:", result[0])

    // Step 4: Verify the agent was created
    console.log("Step 4: Verifying agent creation...")
    const verification = await sql`
      SELECT * FROM agents WHERE email = ${testAgent.email}
    `

    console.log("✅ Agent verification:", verification[0])

    return NextResponse.json({
      success: true,
      message: "Agent creation test completed successfully",
      steps: {
        database_connection: "✅ Success",
        table_exists: tableCheck[0].exists ? "✅ Exists" : "✅ Created",
        agent_creation: "✅ Success",
        agent_verification: "✅ Success",
      },
      created_agent: result[0],
      verification: verification[0],
    })
  } catch (error) {
    console.error("❌ Agent creation test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        details: "Check server logs for more information",
      },
      { status: 500 },
    )
  }
}
