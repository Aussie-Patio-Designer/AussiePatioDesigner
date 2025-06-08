import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("Starting database verification...")

    // Check if agents table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agents'
      );
    `

    console.log("Table exists check:", tableExists[0]?.exists)

    if (!tableExists[0]?.exists) {
      return NextResponse.json({
        success: false,
        error: "Agents table does not exist",
        details: {
          table_exists: false,
          suggestion: "Run the create-agents-table.sql script first",
        },
      })
    }

    // Get table structure
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'agents'
      ORDER BY ordinal_position;
    `

    console.log("Table structure:", tableStructure)

    // Check if table has any data
    const agentCount = await sql`
      SELECT COUNT(*) as count FROM agents;
    `

    console.log("Agent count:", agentCount[0]?.count)

    // Get sample data if any exists
    const sampleAgents = await sql`
      SELECT id, company_name, contact_name, email, url_slug, status, created_at
      FROM agents
      ORDER BY created_at DESC
      LIMIT 5;
    `

    console.log("Sample agents:", sampleAgents)

    // Test insert capability (dry run)
    const testSlug = `test-${Date.now()}`
    const testEmail = `test-${Date.now()}@example.com`

    try {
      await sql`
        INSERT INTO agents (company_name, contact_name, email, url_slug, status)
        VALUES ('Test Company', 'Test Contact', ${testEmail}, ${testSlug}, 'active')
        RETURNING id;
      `

      // Clean up test record
      await sql`
        DELETE FROM agents WHERE email = ${testEmail};
      `

      console.log("Insert test: SUCCESS")
    } catch (insertError) {
      console.error("Insert test failed:", insertError)
      return NextResponse.json({
        success: false,
        error: "Cannot insert into agents table",
        details: {
          table_exists: true,
          insert_error: insertError instanceof Error ? insertError.message : "Unknown error",
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Agents table is fully functional",
      details: {
        table_exists: true,
        table_structure: tableStructure,
        agent_count: Number.parseInt(agentCount[0]?.count || "0"),
        sample_agents: sampleAgents,
        insert_test: "PASSED",
        database_url_configured: !!process.env.DATABASE_URL,
      },
    })
  } catch (error) {
    console.error("Database verification failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database verification failed",
        details: {
          error_message: error instanceof Error ? error.message : "Unknown error",
          database_url_configured: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 },
    )
  }
}
