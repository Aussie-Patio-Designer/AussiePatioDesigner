"use server"

import { put } from "@vercel/blob"
import { getEnvConfig } from "./env-config"

export async function uploadScreenshot(
  screenshotData: string,
  inquiryId: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const config = getEnvConfig()

    // Check if blob storage is configured
    if (!config.BLOB_READ_WRITE_TOKEN) {
      console.log("Blob storage not configured - missing token")
      return { success: false, error: "Blob storage not configured" }
    }

    // Validate screenshot data
    if (!screenshotData || !screenshotData.startsWith("data:image/")) {
      console.log("Invalid screenshot data format")
      return { success: false, error: "Invalid screenshot data format" }
    }

    // Convert base64 data URL to buffer
    const base64Data = screenshotData.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `gazebo-screenshots/${inquiryId}-${timestamp}.png`

    console.log(`Uploading screenshot to ${filename}`)

    // Upload to Vercel Blob with proper error handling
    try {
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: "image/png",
      })

      console.log("Screenshot uploaded successfully:", blob.url)
      return { success: true, url: blob.url }
    } catch (blobError) {
      console.error("Blob upload error:", blobError)
      return {
        success: false,
        error: blobError instanceof Error ? blobError.message : "Blob upload failed",
      }
    }
  } catch (error) {
    console.error("Error in uploadScreenshot function:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
