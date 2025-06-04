import { type NextRequest, NextResponse } from "next/server"
import { uploadScreenshot } from "@/lib/blob-storage"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing screenshot upload...")

    const { screenshot } = await request.json()

    if (!screenshot) {
      return NextResponse.json({ error: "No screenshot provided" }, { status: 400 })
    }

    console.log("📸 Screenshot received, size:", screenshot.length, "characters")
    console.log("📸 Screenshot preview:", screenshot.substring(0, 100) + "...")

    // Test upload
    const result = await uploadScreenshot(screenshot, "test-" + Date.now())

    console.log("📤 Upload result:", result)

    return NextResponse.json({
      success: result.success,
      url: result.url,
      error: result.error,
      message: result.success ? "Screenshot uploaded successfully!" : "Screenshot upload failed",
    })
  } catch (error) {
    console.error("❌ Test screenshot error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
