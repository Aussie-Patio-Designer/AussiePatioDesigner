import { type NextRequest, NextResponse } from "next/server"
import { routeInquiryEmail } from "@/lib/agent-email-routing"
import { resolveSqlClient } from "@/lib/api-db"

export async function POST(request: NextRequest) {
  const resolvedClient = resolveSqlClient("debugging Lockyer routing")

  if ("response" in resolvedClient) {
    return resolvedClient.response
  }

  try {
    const { testUrl, agentSlug } = await request.json()

    console.log("🔍 DEBUGGING LOCKYER SHEDS ROUTING")
    console.log("Test URL:", testUrl)
    console.log("Agent Slug:", agentSlug)

    // Test 1: Check if agents table exists and has data
    const { sql } = resolvedClient

    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'agents'
      );
    `

    const agentsTableExists = tableCheck[0]?.exists || false

    let agentsInTable = []
    let lockyerAgent = null

    if (agentsTableExists) {
      // Get all agents
      agentsInTable = await sql`SELECT id, company_name, email, url_slug, status FROM agents ORDER BY id`

      // Look specifically for Lockyer Sheds
      const lockyerResults = await sql`
        SELECT * FROM agents 
        WHERE url_slug = 'lockyer-sheds' 
        OR lower(company_name) LIKE '%lockyer%'
        OR lower(email) LIKE '%lockyer%'
      `

      if (lockyerResults.length > 0) {
        lockyerAgent = lockyerResults[0]
      }
    }

    // Test 2: Test the routing function
    const routingResult = await routeInquiryEmail(agentSlug, testUrl)

    // Test 3: Test environment variables
    const envCheck = {
      SALES_EMAIL_1: process.env.SALES_EMAIL_1 || "NOT SET",
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "NOT SET",
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
    }

    const debugResult = {
      timestamp: new Date().toISOString(),
      testParameters: {
        testUrl,
        agentSlug,
      },
      database: {
        agentsTableExists,
        totalAgents: agentsInTable.length,
        allAgents: agentsInTable,
        lockyerAgent,
      },
      routing: routingResult,
      environment: envCheck,
      analysis: {
        shouldRouteToAgent: !!lockyerAgent,
        actualRoutingTarget: routingResult.primaryEmail,
        isWorkingCorrectly: lockyerAgent ? routingResult.primaryEmail === lockyerAgent.email : false,
      },
    }

    console.log("🎯 DEBUG RESULT:", debugResult)

    return NextResponse.json(debugResult)
  } catch (error) {
    console.error("❌ Debug error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
