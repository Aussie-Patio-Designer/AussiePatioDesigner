"use server"

import { put } from "@vercel/blob"

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// Validate base64 image data
function validateBase64Image(base64Data: string): { valid: boolean; error?: string } {
  try {
    // Check if it's a valid base64 string with data URL prefix
    if (!base64Data.startsWith("data:image/")) {
      return { valid: false, error: "Invalid image format - must be a data URL" }
    }

    // Extract the base64 part (after the comma)
    const base64Part = base64Data.split(",")[1]
    if (!base64Part) {
      return { valid: false, error: "Invalid base64 data format" }
    }

    // Estimate file size (base64 is ~33% larger than binary)
    const estimatedSize = (base64Part.length * 3) / 4
    const maxSize = 5 * 1024 * 1024 // 5MB limit

    if (estimatedSize > maxSize) {
      return { valid: false, error: `Image too large: ${Math.round(estimatedSize / 1024 / 1024)}MB (max 5MB)` }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: "Failed to validate image data" }
  }
}

// Convert base64 to blob
function base64ToBlob(base64Data: string): Blob {
  const [header, data] = base64Data.split(",")
  const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/png"

  const byteCharacters = atob(data)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

export async function uploadScreenshot(base64Data: string, inquiryId: string): Promise<UploadResult> {
  console.log("🔄 Starting screenshot upload process for inquiry:", inquiryId)

  try {
    // Validate the base64 data
    const validation = validateBase64Image(base64Data)
    if (!validation.valid) {
      console.error("❌ Screenshot validation failed:", validation.error)
      return { success: false, error: validation.error }
    }

    console.log("✅ Screenshot validation passed")

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("❌ BLOB_READ_WRITE_TOKEN not configured")
      return { success: false, error: "Blob storage not configured" }
    }

    console.log("✅ Blob token available")

    // Convert base64 to blob
    const blob = base64ToBlob(base64Data)
    console.log("📦 Converted to blob, size:", blob.size, "bytes")

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `inquiry-${inquiryId}-${timestamp}.png`

    console.log("📤 Uploading to Vercel Blob:", filename)

    // Upload to Vercel Blob
    const result = await put(filename, blob, {
      access: "public",
      contentType: blob.type,
    })

    console.log("✅ Screenshot uploaded successfully!")
    console.log("📍 Upload result:", {
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType,
      size: result.size,
    })

    return {
      success: true,
      url: result.url,
    }
  } catch (error) {
    console.error("❌ Screenshot upload error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Request Entity Too Large")) {
        return { success: false, error: "Image file too large (max 5MB)" }
      }
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Blob storage authentication failed" }
      }
      return { success: false, error: `Upload failed: ${error.message}` }
    }

    return { success: false, error: "Unknown upload error" }
  }
}
