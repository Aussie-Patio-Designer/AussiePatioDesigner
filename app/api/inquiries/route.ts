import { type NextRequest, NextResponse } from "next/server"
import { sendGazeboInquiry } from "@/lib/email"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Received inquiry submission")

    const data = await request.json()

    // Log the inquiry data (without sensitive info)
    console.log("📋 Inquiry data received:", {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      roofType: data.roofType,
      roofCladding: data.roofCladding,
      dimensions: `${data.length}x${data.width}x${data.height}`,
      hasScreenshot: !!data.screenshot,
      screenshotSize: data.screenshot ? `${Math.round(data.screenshot.length / 1024)}KB` : "none",
    })

    // Get the referer to determine if this is from an agent page
    const referer = request.headers.get("referer")
    console.log("🔗 Request referer:", referer)

    let agentInfo = null

    // First check if client-side AGENT_DATA was included
    if (data.agentData) {
      console.log("📋 Agent data found in submission:", data.agentData)
      agentInfo = {
        id: data.agentData.id,
        email: data.agentData.email,
        company_name: data.agentData.company_name,
        url_slug: data.agentData.url_slug,
      }
    }
    // If no agent data in submission, try to extract from referer
    else if (referer) {
      try {
        const url = new URL(referer)
        const pathSegments = url.pathname.split("/").filter(Boolean)
        console.log("📍 URL path segments:", pathSegments)

        // Check if this looks like an agent URL (single path segment)
        if (pathSegments.length === 1) {
          const agentSlug = pathSegments[0]
          console.log("🔍 Looking up agent with slug:", agentSlug)

          // Import neon here to avoid issues
          const sql = neon(process.env.DATABASE_URL!)

          const agentResult = await sql`
            SELECT id, company_name, email, status 
            FROM agents 
            WHERE url_slug = ${agentSlug} 
            AND status = 'active'
            LIMIT 1
          `

          if (agentResult.length > 0) {
            agentInfo = agentResult[0]
            console.log("✅ Found agent:", agentInfo.company_name, agentInfo.email)
          } else {
            console.log("⚠️ No active agent found for slug:", agentSlug)

            // For debugging: check if there's an agent with this slug but inactive
            const inactiveCheck = await sql`
              SELECT id, company_name, status FROM agents 
              WHERE url_slug = ${agentSlug} 
              LIMIT 1
            `

            if (inactiveCheck.length > 0) {
              console.log(`ℹ️ Found agent with slug "${agentSlug}" but status is: ${inactiveCheck[0].status}`)
            }
          }
        }
      } catch (urlError) {
        console.error("❌ Error parsing referer URL:", urlError)
      }
    }

    // Add agent information to the data
    const enrichedData = {
      ...data,
      agentInfo,
      sourceUrl: referer,
    }

    console.log("📤 Processing inquiry with agent info:", {
      hasAgent: !!agentInfo,
      agentCompany: agentInfo?.company_name,
      agentEmail: agentInfo?.email,
    })

    const result = await sendGazeboInquiry(enrichedData)

    if (result.success) {
      console.log("✅ Inquiry processed successfully")
      console.log("📊 Result details:", {
        inquiryId: result.inquiryId,
        screenshotUploaded: result.screenshotUploaded,
        customerEmailSent: result.customerEmailSent,
        salesEmailSent: result.salesEmailSent,
      })
      return NextResponse.json(result)
    } else {
      console.error("❌ Inquiry processing failed:", result.message)
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("💥 Error processing inquiry submission:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error processing inquiry. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
