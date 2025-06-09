import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, customerName } = await request.json()

    console.log("🔍 Tracking inquiry for:", customerEmail)

    const sql = neon(process.env.DATABASE_URL!)

    // Get the most recent inquiry for this customer
    const inquiry = await sql`
      SELECT 
        id,
        customer_name,
        customer_email,
        agent_email,
        agent_company,
        source_url,
        created_at,
        status
      FROM gazebo_inquiries 
      WHERE customer_email = ${customerEmail}
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (inquiry.length === 0) {
      return NextResponse.json({
        found: false,
        message: "No inquiry found for this email",
      })
    }

    const inquiryData = inquiry[0]

    // Check if there's a Lockyer Sheds agent
    const lockyerAgent = await sql`
      SELECT * FROM agents 
      WHERE lower(company_name) LIKE '%lockyer%' 
      AND status = 'active'
      LIMIT 1
    `

    return NextResponse.json({
      found: true,
      inquiry: inquiryData,
      lockyerAgent: lockyerAgent[0] || null,
      routing: {
        expectedEmail: lockyerAgent[0]?.email || "Default sales team",
        actualEmail: inquiryData.agent_email || "Not recorded",
        match: inquiryData.agent_email === lockyerAgent[0]?.email,
        company: inquiryData.agent_company || "Not recorded",
      },
    })
  } catch (error) {
    console.error("Error tracking inquiry:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
