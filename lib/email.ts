"use server"

import { Resend } from "resend"
import { createInquiry, initializeDatabase } from "./database"
import { uploadScreenshot } from "./blob-storage"
import { getEnvConfig } from "./env-config"

interface InquiryData {
  customerName: string
  siteAddress: string
  customerEmail: string
  roofType: string
  roofCladding: string
  roofPitch: number
  length: number
  width: number
  height: number
  hasOverhang: boolean
  overhangSides: string[]
  overhangSize: number
  roofColor: string
  postBeamColor: string
  screenshot?: string
}

// Validate inquiry data
function validateInquiryData(data: InquiryData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.push("Customer name is required and must be at least 2 characters")
  }

  if (!data.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
    errors.push("Valid customer email is required")
  }

  if (!data.siteAddress || data.siteAddress.trim().length < 10) {
    errors.push("Site address is required and must be at least 10 characters")
  }

  // Dimensions
  if (!data.length || data.length < 1000 || data.length > 20000) {
    errors.push("Length must be between 1000mm and 20000mm")
  }

  if (!data.width || data.width < 1000 || data.width > 20000) {
    errors.push("Width must be between 1000mm and 20000mm")
  }

  if (!data.height || data.height < 1000 || data.height > 5000) {
    errors.push("Height must be between 1000mm and 5000mm")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Update the sendCustomerConfirmation function to include 3D design link
async function sendCustomerConfirmation(
  data: InquiryData,
  inquiryId?: number,
): Promise<{ sent: boolean; error?: string }> {
  const config = getEnvConfig()

  // Create the 3D design URL with inquiry parameters
  const designUrl = `${process.env.VERCEL_URL || "https://your-domain.vercel.app"}/?ref=${inquiryId}&design=true&roofType=${encodeURIComponent(data.roofType)}&roofCladding=${encodeURIComponent(data.roofCladding)}&roofPitch=${data.roofPitch}&length=${data.length}&width=${data.width}&height=${data.height}&roofColor=${encodeURIComponent(data.roofColor)}&postBeamColor=${encodeURIComponent(data.postBeamColor)}`

  // Create email content
  const subject = `Your Gazebo Design Inquiry - Confirmation ${inquiryId ? `#${inquiryId.toString().padStart(6, "0")}` : ""}`

  const textContent = `
Thank You for Your Gazebo Inquiry

Dear ${data.customerName},

We've received your gazebo design inquiry and are excited to help bring your vision to life. 
Your request has been submitted successfully and is now being processed.

${inquiryId ? `Reference Number: #${inquiryId.toString().padStart(6, "0")}` : ""}

YOUR DESIGN SUMMARY:
• Roof Type: ${data.roofType}
• Roof Material: ${data.roofCladding}
• Roof Pitch: ${data.roofPitch}°
• Dimensions: ${data.length}mm × ${data.width}mm × ${data.height}mm
• Roof Color: ${data.roofColor}
• Frame Color: ${data.postBeamColor}
• Installation Address: ${data.siteAddress}

VIEW YOUR 3D DESIGN:
You can view and share your custom 3D gazebo design at:
${designUrl}

WHAT HAPPENS NEXT?
Our team will review your gazebo design and contact you within 1-2 business days 
to discuss your project in more detail and provide you with a detailed quote.

If you have any questions about your design or would like to make changes, 
please reply to this email with your reference number.

Thank you for choosing us for your gazebo project!

Best regards,
The Gazebo Design Team
  `.trim()

  // Create HTML content for better formatting
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c5530; border-bottom: 2px solid #4ade80; padding-bottom: 10px;">
        Thank You for Your Gazebo Inquiry
      </h1>
      
      <p>Dear <strong>${data.customerName}</strong>,</p>
      
      <p>We've received your gazebo design inquiry and are excited to help bring your vision to life. 
      Your request has been submitted successfully and is now being processed.</p>
      
      ${inquiryId ? `<p><strong>Reference Number: #${inquiryId.toString().padStart(6, "0")}</strong></p>` : ""}
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5530; margin-top: 0;">Your Design Summary:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Roof Type:</strong> ${data.roofType}</li>
          <li><strong>Roof Material:</strong> ${data.roofCladding}</li>
          <li><strong>Roof Pitch:</strong> ${data.roofPitch}°</li>
          <li><strong>Dimensions:</strong> ${data.length}mm × ${data.width}mm × ${data.height}mm</li>
          <li><strong>Roof Color:</strong> ${data.roofColor}</li>
          <li><strong>Frame Color:</strong> ${data.postBeamColor}</li>
          <li><strong>Installation Address:</strong> ${data.siteAddress}</li>
        </ul>
      </div>
      
      <div style="background: #e7f5e7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #2c5530; margin-top: 0;">View Your 3D Design</h3>
        <p>You can view and share your custom 3D gazebo design:</p>
        <a href="${designUrl}" 
           style="display: inline-block; background: #4ade80; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
          View 3D Design
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">
          Link: <a href="${designUrl}" style="color: #4ade80;">${designUrl}</a>
        </p>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">What Happens Next?</h3>
        <p>Our team will review your gazebo design and contact you within <strong>1-2 business days</strong> 
        to discuss your project in more detail and provide you with a detailed quote.</p>
        
        <p>If you have any questions about your design or would like to make changes, 
        please reply to this email with your reference number.</p>
      </div>
      
      <p style="margin-top: 30px;">Thank you for choosing us for your gazebo project!</p>
      
      <p style="color: #666;">
        Best regards,<br>
        <strong>The Gazebo Design Team</strong>
      </p>
    </div>
  `

  // Check if Resend is configured
  if (!config.RESEND_API_KEY) {
    console.log("⚠️ RESEND_API_KEY not configured - Email would be sent:")
    console.log("To:", data.customerEmail)
    console.log("Subject:", subject)
    console.log("3D Design URL:", designUrl)
    console.log("Content:", textContent)
    return { sent: false, error: "Email service not configured" }
  }

  // Try to send email
  try {
    const resend = new Resend(config.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: "Gazebo Designer <onboarding@resend.dev>",
      to: data.customerEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    })

    console.log("✅ Email sent successfully:", result)
    console.log("📱 3D Design URL included:", designUrl)
    return { sent: true }
  } catch (error) {
    console.error("❌ Error sending customer confirmation email:", error)
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" }
  }
}

// Main function to process inquiry submission
export async function sendGazeboInquiry(data: InquiryData) {
  console.log("🚀 Processing gazebo inquiry for:", data.customerEmail)

  // Validate data
  const validation = validateInquiryData(data)
  if (!validation.valid) {
    return {
      success: false,
      message: `Validation failed: ${validation.errors.join(", ")}`,
    }
  }

  try {
    // Initialize database
    await initializeDatabase()

    // Upload screenshot if provided
    let screenshotUrl: string | undefined
    if (data.screenshot) {
      try {
        const tempId = `temp-${Date.now()}`
        const uploadResult = await uploadScreenshot(data.screenshot, tempId)
        if (uploadResult.success) {
          screenshotUrl = uploadResult.url
        }
      } catch (error) {
        console.warn("Screenshot upload failed:", error)
      }
    }

    // Save inquiry to database
    const inquiryData = {
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      site_address: data.siteAddress,
      roof_type: data.roofType,
      roof_cladding: data.roofCladding,
      roof_pitch: data.roofPitch,
      length: data.length,
      width: data.width,
      height: data.height,
      has_overhang: data.hasOverhang,
      overhang_sides: data.overhangSides,
      overhang_size: data.overhangSize,
      roof_color: data.roofColor,
      post_beam_color: data.postBeamColor,
      screenshot_url: screenshotUrl,
      status: "new" as const,
    }

    const dbResult = await createInquiry(inquiryData)
    if (!dbResult.success) {
      return {
        success: false,
        message: "Failed to save inquiry. Please try again.",
      }
    }

    const inquiryId = dbResult.id
    console.log("💾 Inquiry saved to database with ID:", inquiryId)

    // Send confirmation email
    const emailResult = await sendCustomerConfirmation(data, inquiryId)

    // Return success with email status
    const referenceNumber = inquiryId?.toString().padStart(6, "0")

    if (emailResult.sent) {
      return {
        success: true,
        message: `Inquiry submitted successfully! Reference #${referenceNumber}. Confirmation email sent to ${data.customerEmail}.`,
        emailSent: true,
      }
    } else {
      return {
        success: true,
        message: `Inquiry submitted successfully! Reference #${referenceNumber}. Note: Confirmation email could not be sent (${emailResult.error}). We'll contact you directly.`,
        emailSent: false,
        emailError: emailResult.error,
      }
    }
  } catch (error) {
    console.error("❌ Error processing inquiry:", error)
    return {
      success: false,
      message: "Failed to submit inquiry. Please try again.",
    }
  }
}
