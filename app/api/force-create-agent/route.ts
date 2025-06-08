import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    console.log("=== FORCE CREATE AGENT TEST ===")

    // Step 1: Test basic connection
    console.log("1. Testing database connection...")
    await sql`SELECT 1 as test`
    console.log("✅ Database connection works")

    // Step 2: Drop and recreate table (force clean slate)
    console.log("2. Dropping existing agents table if exists...")
    await sql`DROP TABLE IF EXISTS agents`
    console.log("✅ Table dropped")

    // Step 3: Create fresh table
    console.log("3. Creating fresh agents table...")
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Fresh table created")

    // Step 4: Insert test agent
    console.log("4. Inserting test agent...")
    const timestamp = Date.now()
    const result = await sql`
      INSERT INTO agents (
        company_name, contact_name, email, url_slug, subscription_type
      ) VALUES (
        'Test Company ' || ${timestamp},
        'Test Contact',
        'test' || ${timestamp} || '@example.com',
        'test-company-' || ${timestamp},
        'basic'
      )
      RETURNING *
    `
    console.log("✅ Test agent inserted")

    // Step 5: Verify agent exists
    console.log("5. Verifying agent exists...")
    const agents = await sql`SELECT * FROM agents`
    console.log("✅ Agent verified")

    return NextResponse.json({
      success: true,
      message: "Agent creation test completed successfully!",
      steps: {
        connection: "✅ Success",
        table_drop: "✅ Success",
        table_create: "✅ Success",
        agent_insert: "✅ Success",
        agent_verify: "✅ Success",
      },
      created_agent: result[0],
      total_agents: agents.length,
      all_agents: agents,
    })
  } catch (error) {
    console.error("❌ Error in force create:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        step: "Failed during execution",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Simple agent creation without checks
    const timestamp = Date.now()
    const result = await sql`
      INSERT INTO agents (
        company_name, contact_name, email, url_slug, subscription_type
      ) VALUES (
        'New Company ' || ${timestamp},
        'New Contact',
        'new' || ${timestamp} || '@example.com',
        'new-company-' || ${timestamp},
        'premium'
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: "Agent created successfully!",
      agent: result[0],
      customer_url: `https://aussie-patio-designer.vercel.app/${result[0].url_slug}`,
    })
  } catch (error) {
    console.error("❌ Error creating agent:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
