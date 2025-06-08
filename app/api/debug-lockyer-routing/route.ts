import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("🔍 Debugging Lockyer Sheds routing...")

    const sql = neon(process.env.DATABASE_URL!)

    // Check if agents table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'agents'
      );
    `

    if (!tableCheck[0]?.exists) {
      return NextResponse.json({
        error: "Agents table does not exist",
        routing: "Default sales team",
        emails: [process.env.SALES_EMAIL_1, process.env.SALES_EMAIL_2, process.env.SALES_EMAIL_3].filter(Boolean),
      })
    }

    // Look for Lockyer Sheds agent
    const lockyerAgent = await sql`
      SELECT * FROM agents 
      WHERE lower(company_name) LIKE '%lockyer%' 
      OR lower(url_slug) LIKE '%lockyer%'
      ORDER BY created_at DESC
    `

    // Check all agents
    const allAgents = await sql`
      SELECT id, company_name, email, url_slug, status, created_at 
      FROM agents 
      ORDER BY created_at DESC
    `

    // Check recent inquiries for Lockyer
    const recentInquiries = await sql`
      SELECT 
        id, 
        customer_name, 
        customer_email, 
        agent_email, 
        agent_company, 
        source_url,
        created_at 
      FROM gazebo_inquiries 
      WHERE 
        lower(agent_company) LIKE '%lockyer%' 
        OR lower(source_url) LIKE '%lockyer%'
        OR lower(agent_email) LIKE '%lockyer%'
      ORDER BY created_at DESC 
      LIMIT 10
    `

    // Environment variables check
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      SALES_EMAIL_1: process.env.SALES_EMAIL_1 || "Not set",
      SALES_EMAIL_2: process.env.SALES_EMAIL_2 || "Not set",
      SALES_EMAIL_3: process.env.SALES_EMAIL_3 || "Not set",
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      lockyerAgent: lockyerAgent.length > 0 ? lockyerAgent[0] : null,
      allAgents: allAgents,
      recentLockyerInquiries: recentInquiries,
      environment: envCheck,
      routing: {
        hasLockyerAgent: lockyerAgent.length > 0,
        activeLockyerAgent: lockyerAgent.find((a) => a.status === "active"),
        defaultSalesEmails: [process.env.SALES_EMAIL_1, process.env.SALES_EMAIL_2, process.env.SALES_EMAIL_3].filter(
          Boolean,
        ),
      },
    })
  } catch (error) {
    console.error("❌ Error debugging Lockyer routing:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        routing: "Error - falling back to default",
      },
      { status: 500 },
    )
  }
}
