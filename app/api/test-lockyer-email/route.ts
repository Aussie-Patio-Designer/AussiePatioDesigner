import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing Lockyer Sheds email routing...")

    const sql = neon(process.env.DATABASE_URL!)

    // Get Lockyer agent
    const lockyerAgent = await sql`
      SELECT * FROM agents 
      WHERE lower(company_name) LIKE '%lockyer%' 
      OR lower(url_slug) LIKE '%lockyer%'
      AND status = 'active'
      LIMIT 1
    `

    if (lockyerAgent.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No active Lockyer Sheds agent found",
        suggestion: "Check if agent exists and is active",
      })
    }

    const agent = lockyerAgent[0]
    console.log("🏢 Found Lockyer agent:", agent.company_name, agent.email)

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY not configured",
        agent: agent,
      })
    }

    // Send test email
    const resend = new Resend(process.env.RESEND_API_KEY)

    const testEmailContent = `
      🧪 TEST EMAIL - Lockyer Sheds Routing

      This is a test email to verify that inquiries are being routed correctly to Lockyer Sheds.

      Agent Details:
      - Company: ${agent.company_name}
      - Email: ${agent.email}
      - URL Slug: ${agent.url_slug}
      - Status: ${agent.status}

      If you receive this email, the routing is working correctly!

      Test sent at: ${new Date().toISOString()}
    `

    console.log("📧 Sending test email to:", agent.email)

    const result = await resend.emails.send({
      from: "Aussie Patio Test <onboarding@resend.dev>",
      to: agent.email,
      subject: "🧪 Test Email - Lockyer Sheds Routing Verification",
      text: testEmailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🧪 TEST EMAIL - Lockyer Sheds Routing</h2>
          <p>This is a test email to verify that inquiries are being routed correctly to Lockyer Sheds.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Agent Details:</h3>
            <ul>
              <li><strong>Company:</strong> ${agent.company_name}</li>
              <li><strong>Email:</strong> ${agent.email}</li>
              <li><strong>URL Slug:</strong> ${agent.url_slug}</li>
              <li><strong>Status:</strong> ${agent.status}</li>
            </ul>
          </div>
          
          <p style="color: #28a745;"><strong>✅ If you receive this email, the routing is working correctly!</strong></p>
          
          <p style="color: #666; font-size: 12px;">Test sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    })

    console.log("✅ Test email sent successfully:", result)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      agent: agent,
      emailResult: result,
      instructions: "Check gazi@lockyersheds.com.au for the test email",
    })
  } catch (error) {
    console.error("❌ Error sending test email:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "Failed to send test email to Lockyer Sheds",
      },
      { status: 500 },
    )
  }
}
