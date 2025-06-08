import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL environment variable is not set",
        },
        { status: 500 },
      )
    }

    console.log("Testing database connection...")
    const sql = neon(databaseUrl)

    // Test basic connection
    const connectionTest = await sql`SELECT 1 as connection_test`
    console.log("Connection test result:", connectionTest)

    // Check if agents table exists
    console.log("Checking if agents table exists...")
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agents'
      ) as table_exists
    `
    const tableExists = tableCheck[0]?.table_exists

    if (!tableExists) {
      console.log("Agents table does not exist, creating it...")

      // Create the table
      await sql`
        CREATE TABLE IF NOT EXISTS agents (
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
    }

    // Get table structure
    console.log("Getting table structure...")
    const tableStructure = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'agents'
      ORDER BY 
        ordinal_position
    `

    // Test insert
    console.log("Testing insert operation...")
    const testTimestamp = Date.now()
    const testInsert = await sql`
      INSERT INTO agents (
        company_name, 
        contact_name, 
        email, 
        phone, 
        url_slug, 
        subscription_type
      ) VALUES (
        'API Test Company', 
        'API Test User', 
        ${"api-test-" + testTimestamp + "@example.com"}, 
        '+61 400 000 000', 
        ${"api-test-" + testTimestamp}, 
        'basic'
      )
      RETURNING id, company_name, email, url_slug, created_at
    `

    console.log("Insert test result:", testInsert)

    // Get all agents
    console.log("Fetching all agents...")
    const agents = await sql`
      SELECT * FROM agents 
      ORDER BY created_at DESC 
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      connection: {
        test: connectionTest[0],
        url: databaseUrl.replace(/:[^:]*@/, ":***@"), // Hide password
      },
      table: {
        exists: tableExists,
        structure: tableStructure,
        recordCount: agents.length,
      },
      testInsert: testInsert[0],
      recentAgents: agents,
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
