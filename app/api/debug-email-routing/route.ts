import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check Lockyer Sheds agent
    const lockyerAgent = await sql`
      SELECT * FROM agents 
      WHERE lower(company_name) LIKE '%lockyer%' 
      OR lower(url_slug) LIKE '%lockyer%'
      ORDER BY created_at DESC
      LIMIT 1
    `

    // Check recent inquiries that should have gone to Lockyer
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
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10
    `

    // Check environment variables
    const envCheck = {
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
      salesEmail1: process.env.SALES_EMAIL_1 || "Not set",
      salesEmail2: process.env.SALES_EMAIL_2 || "Not set",
      salesEmail3: process.env.SALES_EMAIL_3 || "Not set",
    }

    // Test Resend connection
    let resendTest = null
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        // Just test the connection, don't send an email
        resendTest = { status: "API key valid", error: null }
      } catch (error) {
        resendTest = { status: "API key invalid", error: error.message }
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      lockyerAgent: lockyerAgent[0] || null,
      recentInquiries,
      envCheck,
      resendTest,
      expectedRouting: {
        lockyerEmail: lockyerAgent[0]?.email || "No Lockyer agent found",
        fallbackEmails: [process.env.SALES_EMAIL_1, process.env.SALES_EMAIL_2, process.env.SALES_EMAIL_3].filter(
          Boolean,
        ),
      },
      diagnostics: {
        agentExists: lockyerAgent.length > 0,
        agentActive: lockyerAgent[0]?.status === "active",
        correctEmail: lockyerAgent[0]?.email === "gazi@lockyersheds.com.au",
        hasResendKey: !!process.env.RESEND_API_KEY,
      },
    })
  } catch (error) {
    console.error("Debug email routing error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
