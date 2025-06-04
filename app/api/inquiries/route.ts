import { type NextRequest, NextResponse } from "next/server"
import { sendGazeboInquiry } from "@/lib/email"

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
      screenshotPreview: data.screenshot ? data.screenshot.substring(0, 50) + "..." : "none",
    })

    // Validate and clean screenshot data
    if (data.screenshot) {
      if (typeof data.screenshot !== "string") {
        console.warn("⚠️ Invalid screenshot data type, removing")
        data.screenshot = undefined
      } else if (!data.screenshot.startsWith("data:image/")) {
        console.warn("⚠️ Invalid screenshot format, removing")
        data.screenshot = undefined
      } else if (data.screenshot.length > 10 * 1024 * 1024) {
        // 10MB limit for base64
        console.warn("⚠️ Screenshot too large (>10MB), removing")
        data.screenshot = undefined
      } else if (data.screenshot.length > 6 * 1024 * 1024) {
        // 6MB limit - warn but continue
        console.warn("⚠️ Screenshot is large (>6MB), may cause issues")
      }
    }

    console.log("📸 Screenshot validation complete:", {
      hasScreenshot: !!data.screenshot,
      size: data.screenshot ? `${Math.round(data.screenshot.length / 1024)}KB` : "none",
    })

    const result = await sendGazeboInquiry(data)

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
