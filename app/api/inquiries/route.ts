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
      hasAgentData: !!data.agentData,
    })

    // Get the referer to determine if this is from an agent page
    const referer = request.headers.get("referer")
    console.log("🔗 Request referer:", referer)

    let agentInfo = null

    // Method 1: Check if client-side AGENT_DATA was included in the submission
    if (data.agentData && data.agentData.email) {
      console.log("📋 Agent data found in submission:", {
        id: data.agentData.id,
        company: data.agentData.company_name,
        email: data.agentData.email,
        slug: data.agentData.url_slug,
      })

      agentInfo = {
        id: data.agentData.id,
        email: data.agentData.email,
        company_name: data.agentData.company_name,
        url_slug: data.agentData.url_slug,
      }
    }
    // Method 2: Extract from referer URL if no agent data in submission
    else if (referer) {
      try {
        const url = new URL(referer)
        const pathSegments = url.pathname.split("/").filter(Boolean)
        console.log("📍 URL path segments:", pathSegments)

        // Check if this looks like an agent URL (single path segment, not admin/api/etc)
        if (pathSegments.length === 1 && !["admin", "api", "debug", "test"].includes(pathSegments[0])) {
          const agentSlug = pathSegments[0]
          console.log("🔍 Looking up agent with slug:", agentSlug)

          const sql = neon(process.env.DATABASE_URL!)

          // First check if agents table exists
          const tableCheck = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = 'agents'
            );
          `

          if (!tableCheck[0]?.exists) {
            console.error("❌ Agents table does not exist")
          } else {
            const agentResult = await sql`
              SELECT id, company_name, email, status, url_slug
              FROM agents 
              WHERE url_slug = ${agentSlug} 
              AND status = 'active'
              LIMIT 1
            `

            if (agentResult.length > 0) {
              agentInfo = agentResult[0]
              console.log("✅ Found agent via URL lookup:", {
                company: agentInfo.company_name,
                email: agentInfo.email,
                slug: agentInfo.url_slug,
              })
            } else {
              console.log("⚠️ No active agent found for slug:", agentSlug)

              // Debug: check if there's an agent with this slug but inactive
              const inactiveCheck = await sql`
                SELECT id, company_name, status, url_slug FROM agents 
                WHERE url_slug = ${agentSlug} 
                LIMIT 1
              `

              if (inactiveCheck.length > 0) {
                console.log(`ℹ️ Found agent with slug "${agentSlug}" but status is: ${inactiveCheck[0].status}`)
              } else {
                // Check for similar slugs
                const similarCheck = await sql`
                  SELECT id, url_slug, company_name, status FROM agents 
                  WHERE lower(url_slug) LIKE ${`%${agentSlug.toLowerCase()}%`}
                  LIMIT 3
                `
                if (similarCheck.length > 0) {
                  console.log(
                    "ℹ️ Found similar agents:",
                    similarCheck.map((a) => `${a.url_slug} (${a.status})`),
                  )
                }
              }
            }
          }
        } else {
          console.log("ℹ️ URL doesn't match agent pattern:", pathSegments)
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

    console.log("📤 Processing inquiry with routing info:", {
      hasAgent: !!agentInfo,
      agentCompany: agentInfo?.company_name || "N/A",
      agentEmail: agentInfo?.email || "Default sales team",
      routingMethod: data.agentData ? "client-data" : agentInfo ? "url-lookup" : "default",
    })

    const result = await sendGazeboInquiry(enrichedData)

    if (result.success) {
      console.log("✅ Inquiry processed successfully")
      console.log("📊 Result details:", {
        inquiryId: result.inquiryId,
        screenshotUploaded: result.screenshotUploaded,
        customerEmailSent: result.customerEmailSent,
        salesEmailSent: result.salesEmailSent,
        routedToAgent: !!agentInfo,
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
