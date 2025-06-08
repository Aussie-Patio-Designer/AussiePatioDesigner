import { type NextRequest, NextResponse } from "next/server"
import { sendGazeboInquiry } from "@/lib/email"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Received inquiry submission")

    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000) // 30 second timeout
    })

    const dataPromise = request.json()
    const data = await Promise.race([dataPromise, timeoutPromise])

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

    // Validate required fields
    if (!data.customerName || !data.customerEmail || !data.customerPhone || !data.siteAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields. Please fill in all customer information.",
        },
        { status: 400 },
      )
    }

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

          try {
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
          } catch (dbError) {
            console.error("❌ Database error during agent lookup:", dbError)
            // Continue without agent info
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

    // 🎯 ENHANCED LOGGING FOR LOCKYER SHEDS DEBUGGING
    console.log("🎯 LOCKYER SHEDS ROUTING DEBUG:")
    console.log("📤 Processing inquiry with routing info:", {
      hasAgent: !!agentInfo,
      agentCompany: agentInfo?.company_name || "N/A",
      agentEmail: agentInfo?.email || "Default sales team",
      routingMethod: data.agentData ? "client-data" : agentInfo ? "url-lookup" : "default",
      isLockyerSheds:
        agentInfo?.company_name?.toLowerCase().includes("lockyer") ||
        agentInfo?.url_slug?.toLowerCase().includes("lockyer") ||
        referer?.toLowerCase().includes("lockyer"),
      refererUrl: referer,
      pathSegments: referer ? new URL(referer).pathname.split("/").filter(Boolean) : [],
    })

    // Special logging for Lockyer Sheds
    if (
      agentInfo?.company_name?.toLowerCase().includes("lockyer") ||
      agentInfo?.url_slug?.toLowerCase().includes("lockyer") ||
      referer?.toLowerCase().includes("lockyer")
    ) {
      console.log("🏢 LOCKYER SHEDS INQUIRY DETECTED!")
      console.log("📧 Email will be sent to:", agentInfo?.email || "Default sales team")
      console.log("🏢 Company:", agentInfo?.company_name || "N/A")
      console.log("🔗 URL Slug:", agentInfo?.url_slug || "N/A")
    }

    // Process the inquiry with timeout
    const inquiryPromise = sendGazeboInquiry(enrichedData)
    const result = await Promise.race([
      inquiryPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Inquiry processing timeout")), 25000)),
    ])

    if (result.success) {
      console.log("✅ Inquiry processed successfully")
      console.log("📊 Result details:", {
        inquiryId: result.inquiryId,
        screenshotUploaded: result.screenshotUploaded,
        customerEmailSent: result.customerEmailSent,
        salesEmailSent: result.salesEmailSent,
        routedToAgent: !!agentInfo,
      })

      // Additional logging for Lockyer Sheds
      if (agentInfo?.company_name?.toLowerCase().includes("lockyer")) {
        console.log("🎯 LOCKYER SHEDS INQUIRY COMPLETED!")
        console.log("📧 Final email destination:", agentInfo.email)
        console.log("📝 Inquiry ID:", result.inquiryId)
      }

      return NextResponse.json(result)
    } else {
      console.error("❌ Inquiry processing failed:", result.message)
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("💥 Error processing inquiry submission:", error)

    // Provide more specific error messages
    let errorMessage = "Server error processing inquiry. Please try again."

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again with a smaller image or check your connection."
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (error.message.includes("database")) {
        errorMessage = "Database error. Please try again in a moment."
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
