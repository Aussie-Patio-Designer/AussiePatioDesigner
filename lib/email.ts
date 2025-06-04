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

// Get the correct domain URL
function getBaseUrl(): string {
  // In production, use the Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // For development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }

  // Fallback to the new Vercel domain
  return "https://aussie-patio-designer.vercel.app"
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

// Professional customer confirmation email
async function sendCustomerConfirmation(
  data: InquiryData,
  inquiryId?: number,
): Promise<{ sent: boolean; error?: string }> {
  const config = getEnvConfig()
  const baseUrl = getBaseUrl()

  // Create the 3D design URL with inquiry parameters
  const designUrl = `${baseUrl}/?ref=${inquiryId}&design=true&roofType=${encodeURIComponent(data.roofType)}&roofCladding=${encodeURIComponent(data.roofCladding)}&roofPitch=${data.roofPitch}&length=${data.length}&width=${data.width}&height=${data.height}&roofColor=${encodeURIComponent(data.roofColor)}&postBeamColor=${encodeURIComponent(data.postBeamColor)}`

  const referenceNumber = inquiryId ? `#${inquiryId.toString().padStart(6, "0")}` : ""
  const subject = `Patio/Gazebo Design Inquiry Confirmation ${referenceNumber}`

  // Professional HTML email template for customer
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Patio/Gazebo Design Confirmation</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f5f5f5;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e0e0e0;
        }
        
        .header {
          background: #333333;
          padding: 30px;
          text-align: center;
        }
        
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .header p {
          color: #e0e0e0;
          font-size: 16px;
          font-weight: 400;
        }
        
        .reference-badge {
          display: inline-block;
          background: #555555;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          margin-top: 12px;
        }
        
        .content {
          padding: 30px;
        }
        
        .greeting {
          font-size: 18px;
          color: #333333;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .message {
          font-size: 16px;
          color: #555555;
          margin-bottom: 25px;
          line-height: 1.6;
        }
        
        .specs-section {
          background: #f9f9f9;
          border-radius: 4px;
          padding: 20px;
          margin: 25px 0;
          border: 1px solid #e0e0e0;
        }
        
        .specs-title {
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 10px;
        }
        
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .spec-item {
          background: #ffffff;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }
        
        .spec-label {
          font-size: 12px;
          font-weight: 600;
          color: #777777;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        
        .spec-value {
          font-size: 16px;
          font-weight: 500;
          color: #333333;
        }
        
        .design-section {
          background: #f9f9f9;
          border-radius: 4px;
          padding: 25px 20px;
          text-align: center;
          margin: 25px 0;
          border: 1px solid #e0e0e0;
        }
        
        .design-title {
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 10px;
        }
        
        .design-subtitle {
          font-size: 16px;
          color: #555555;
          margin-bottom: 20px;
        }
        
        .design-image {
          max-width: 100%;
          height: auto;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .cta-button {
          display: inline-block;
          background: #555555;
          color: #ffffff;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .design-link {
          font-size: 12px;
          color: #777777;
          word-break: break-all;
          margin-top: 10px;
        }
        
        .next-steps {
          background: #f9f9f9;
          border-radius: 4px;
          padding: 20px;
          margin: 25px 0;
          border: 1px solid #e0e0e0;
        }
        
        .next-steps-title {
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 10px;
        }
        
        .next-steps-content {
          color: #555555;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .footer {
          background: #f5f5f5;
          padding: 25px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        
        .footer-message {
          font-size: 14px;
          color: #777777;
          margin-bottom: 10px;
        }
        
        .footer-signature {
          font-size: 14px;
          color: #333333;
          font-weight: 500;
        }
        
        .footer-credit {
          margin-top: 15px;
          font-size: 12px;
          color: #999999;
        }
        
        .domain-info {
          background: #f0f8ff;
          border: 1px solid #d0e7ff;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        
        .domain-info p {
          color: #2563eb;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
        
        @media (max-width: 640px) {
          .email-container {
            width: 100%;
          }
          
          .content, .header {
            padding: 20px 15px;
          }
          
          .specs-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>Thank You for Your Inquiry</h1>
          <p>Your patio/gazebo design request has been received</p>
          ${referenceNumber ? `<div class="reference-badge">Reference ${referenceNumber}</div>` : ""}
        </div>
        
        <!-- Content -->
        <div class="content">
          <div class="greeting">Dear ${data.customerName},</div>
          
          <div class="message">
            Thank you for submitting your patio/gazebo design inquiry. Your request has been received and is now being processed by our team.
          </div>
          
          <!-- Domain Info -->
          <div class="domain-info">
            <p>🌐 Visit us at: aussie-patio-designer.vercel.app</p>
          </div>
          
          <!-- Design Specifications -->
          <div class="specs-section">
            <div class="specs-title">Design Specifications</div>
            <div class="specs-grid">
              <div class="spec-item">
                <div class="spec-label">Roof Type</div>
                <div class="spec-value">${data.roofType}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Roof Material</div>
                <div class="spec-value">${data.roofCladding}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Roof Pitch</div>
                <div class="spec-value">${data.roofPitch}°</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Dimensions</div>
                <div class="spec-value">${data.length} × ${data.width} × ${data.height}mm</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Roof Color</div>
                <div class="spec-value">${data.roofColor}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Frame Color</div>
                <div class="spec-value">${data.postBeamColor}</div>
              </div>
            </div>
          </div>
          
          <!-- 3D Design Section -->
          <div class="design-section">
            <div class="design-title">Your 3D Design Preview</div>
            ${
              data.screenshot
                ? `<img src="${data.screenshot}" alt="3D Patio/Gazebo Design" class="design-image" />`
                : `<p style="color: #777777; font-style: italic; margin-bottom: 20px;">Preview image not available</p>`
            }
            <a href="${designUrl}" class="cta-button">View Interactive Design</a>
            <div class="design-link">
              Access link: <a href="${designUrl}" style="color: #555555;">${designUrl}</a>
            </div>
          </div>
          
          <!-- Next Steps -->
          <div class="next-steps">
            <div class="next-steps-title">Next Steps</div>
            <div class="next-steps-content">
              <p>Our team will contact you within 24-48 hours to discuss your project in detail and provide you with a comprehensive quote. We'll review your specifications and may suggest optimizations to ensure the best outcome for your patio/gazebo project.</p>
              <br>
              <p>If you have any immediate questions or would like to make changes to your design, please reply to this email with your reference number.</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-message">Thank you for choosing us for your patio/gazebo project.</div>
          <div class="footer-signature">
            The Aussie Patio Design Team
          </div>
          <div class="footer-credit">Generated by Gazi OGUTCU 2025</div>
        </div>
      </div>
    </body>
    </html>
  `

  // Create text version for email clients that don't support HTML
  const textContent = `
THANK YOU FOR YOUR PATIO/GAZEBO INQUIRY
${referenceNumber ? `Reference: ${referenceNumber}` : ""}

Dear ${data.customerName},

Thank you for submitting your patio/gazebo design inquiry. Your request has been received and is now being processed by our team.

Visit us at: aussie-patio-designer.vercel.app

YOUR DESIGN SPECIFICATIONS:
• Roof Type: ${data.roofType}
• Roof Material: ${data.roofCladding}
• Roof Pitch: ${data.roofPitch}°
• Dimensions: ${data.length}mm × ${data.width}mm × ${data.height}mm
• Roof Color: ${data.roofColor}
• Frame Color: ${data.postBeamColor}
• Installation Address: ${data.siteAddress}

VIEW YOUR 3D DESIGN:
${designUrl}

WHAT HAPPENS NEXT?
Our team will contact you within 24-48 hours to discuss your project in detail and provide you with a comprehensive quote. We'll review your specifications and may suggest optimizations to ensure the best outcome for your patio/gazebo project.

If you have any immediate questions or would like to make changes to your design, please reply to this email with your reference number.

Thank you for choosing us for your patio/gazebo project.

Best regards,
The Aussie Patio Design Team

Generated by Gazi OGUTCU 2025
  `.trim()

  // Check if Resend is configured
  if (!config.RESEND_API_KEY) {
    console.log("⚠️ RESEND_API_KEY not configured - Email would be sent:")
    console.log("To:", data.customerEmail)
    console.log("Subject:", subject)
    return { sent: false, error: "Email service not configured" }
  }

  // Try to send email
  try {
    const resend = new Resend(config.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: "Aussie Patio Designer <onboarding@resend.dev>",
      to: data.customerEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    })

    console.log("✅ Customer confirmation email sent successfully:", result)
    return { sent: true }
  } catch (error) {
    console.error("❌ Error sending customer confirmation email:", error)
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" }
  }
}

// Professional sales team notification email
async function sendSalesTeamNotification(
  data: InquiryData,
  inquiryId?: number,
  screenshotUrl?: string,
): Promise<{ sent: boolean; error?: string }> {
  const config = getEnvConfig()
  const baseUrl = getBaseUrl()

  // Sales team email addresses
  const salesTeamEmails = [process.env.SALES_EMAIL_1, process.env.SALES_EMAIL_2, process.env.SALES_EMAIL_3].filter(
    (email) => email && email.trim() !== "",
  )

  if (salesTeamEmails.length === 0) {
    console.log("⚠️ No sales team emails configured in environment variables")
    return { sent: false, error: "No sales team emails configured" }
  }

  const referenceNumber = inquiryId ? `#${inquiryId.toString().padStart(6, "0")}` : "N/A"
  const designUrl = `${baseUrl}/?ref=${inquiryId}&design=true&roofType=${encodeURIComponent(data.roofType)}&roofCladding=${encodeURIComponent(data.roofCladding)}&roofPitch=${data.roofPitch}&length=${data.length}&width=${data.width}&height=${data.height}&roofColor=${encodeURIComponent(data.roofColor)}&postBeamColor=${encodeURIComponent(data.postBeamColor)}`

  const subject = `New Patio/Gazebo Inquiry ${referenceNumber} - ${data.customerName}`

  // Professional HTML email template for sales team
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Patio/Gazebo Inquiry</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f5f5f5;
        }
        
        .email-container {
          max-width: 700px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e0e0e0;
        }
        
        .header {
          background: #333333;
          padding: 25px;
          text-align: center;
        }
        
        .alert-badge {
          display: inline-block;
          background: #555555;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .header .reference {
          color: #e0e0e0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .header .timestamp {
          color: #cccccc;
          font-size: 14px;
          margin-top: 8px;
        }
        
        .content {
          padding: 30px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .info-card {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 15px;
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #777777;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: 500;
          color: #333333;
          word-break: break-word;
        }
        
        .email-link {
          color: #555555;
          text-decoration: none;
          font-weight: 500;
        }
        
        .email-link:hover {
          text-decoration: underline;
        }
        
        .specs-table {
          width: 100%;
          border-collapse: collapse;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .specs-table th {
          background: #555555;
          color: #ffffff;
          padding: 12px 15px;
          text-align: left;
          font-weight: 500;
          font-size: 14px;
        }
        
        .specs-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 14px;
        }
        
        .specs-table tr:last-child td {
          border-bottom: none;
        }
        
        .specs-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .design-preview {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 25px;
          text-align: center;
        }
        
        .design-preview h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 15px;
        }
        
        .screenshot {
          max-width: 100%;
          height: auto;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin: 15px 0;
        }
        
        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        
        .btn {
          display: inline-block;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          text-align: center;
        }
        
        .btn-primary {
          background: #555555;
          color: #ffffff;
        }
        
        .btn-secondary {
          background: #777777;
          color: #ffffff;
        }
        
        .priority-banner {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 15px;
          margin: 25px 0;
          text-align: center;
        }
        
        .priority-banner h3 {
          color: #333333;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .priority-banner p {
          color: #555555;
          font-size: 14px;
        }
        
        .footer {
          background: #f5f5f5;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        
        .footer-text {
          color: #777777;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .footer-credit {
          margin-top: 10px;
          font-size: 12px;
          color: #999999;
        }
        
        .domain-info {
          background: #f0f8ff;
          border: 1px solid #d0e7ff;
          border-radius: 4px;
          padding: 10px;
          margin: 15px 0;
          text-align: center;
        }
        
        .domain-info p {
          color: #2563eb;
          font-size: 12px;
          font-weight: 500;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .email-container {
            width: 100%;
          }
          
          .content, .header {
            padding: 20px 15px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="alert-badge">NEW INQUIRY</div>
          <h1>Patio/Gazebo Design Request</h1>
          <div class="reference">Reference: ${referenceNumber}</div>
          <div class="timestamp">Submitted: ${new Date().toLocaleString()}</div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Domain Info -->
          <div class="domain-info">
            <p>🌐 aussie-patio-designer.vercel.app</p>
          </div>
          
          <!-- Customer Information -->
          <div class="section">
            <div class="section-title">
              Customer Information
            </div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">Customer Name</div>
                <div class="info-value">${data.customerName}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Email Address</div>
                <div class="info-value">
                  <a href="mailto:${data.customerEmail}" class="email-link">${data.customerEmail}</a>
                </div>
              </div>
              <div class="info-card" style="grid-column: 1 / -1;">
                <div class="info-label">Installation Address</div>
                <div class="info-value">${data.siteAddress}</div>
              </div>
            </div>
          </div>
          
          <!-- Patio/Gazebo Specifications -->
          <div class="section">
            <div class="section-title">
              Design Specifications
            </div>
            <table class="specs-table">
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Roof Type</td>
                  <td>${data.roofType}</td>
                </tr>
                <tr>
                  <td>Roof Cladding</td>
                  <td>${data.roofCladding}</td>
                </tr>
                <tr>
                  <td>Roof Pitch</td>
                  <td>${data.roofPitch}°</td>
                </tr>
                <tr>
                  <td>Dimensions</td>
                  <td>L: ${data.length}mm × W: ${data.width}mm × H: ${data.height}mm</td>
                </tr>
                <tr>
                  <td>Roof Color</td>
                  <td>${data.roofColor}</td>
                </tr>
                <tr>
                  <td>Frame Color</td>
                  <td>${data.postBeamColor}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 3D Design Preview -->
          <div class="section">
            <div class="section-title">
              3D Design Preview
            </div>
            <div class="design-preview">
              <h3>Customer's Design</h3>
              ${
                screenshotUrl
                  ? `<img src="${screenshotUrl}" alt="3D Patio/Gazebo Design Preview" class="screenshot" />`
                  : `<div style="background: #f0f0f0; padding: 30px; border-radius: 4px; color: #777777; font-style: italic; text-align: center;">3D design screenshot not available</div>`
              }
              <div class="action-buttons">
                <a href="mailto:${data.customerEmail}?subject=Re: Your Patio/Gazebo Inquiry ${referenceNumber}&body=Dear ${data.customerName},%0D%0A%0D%0AThank you for your patio/gazebo inquiry. We have reviewed your requirements and would like to discuss your project further.%0D%0A%0D%0ABest regards,%0D%0AThe Sales Team" class="btn btn-primary">
                  Reply to Customer
                </a>
                <a href="${designUrl}" class="btn btn-secondary">
                  View 3D Design
                </a>
              </div>
            </div>
          </div>
          
          <!-- Priority Banner -->
          <div class="priority-banner">
            <h3>Follow-up Required</h3>
            <p>Please contact this customer within 24 hours for optimal conversion rates</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">
            This inquiry was automatically generated from the Aussie Patio Designer tool.
          </div>
          <div class="footer-credit">Generated by Gazi OGUTCU 2025</div>
        </div>
      </div>
    </body>
    </html>
  `

  // Create text version
  const textContent = `
NEW PATIO/GAZEBO INQUIRY ${referenceNumber}
Submitted: ${new Date().toLocaleString()}

Visit: aussie-patio-designer.vercel.app

CUSTOMER INFORMATION:
- Name: ${data.customerName}
- Email: ${data.customerEmail}
- Installation Address: ${data.siteAddress}

PATIO/GAZEBO SPECIFICATIONS:
- Roof Type: ${data.roofType}
- Roof Cladding: ${data.roofCladding}
- Roof Pitch: ${data.roofPitch}°
- Dimensions: ${data.length}mm × ${data.width}mm × ${data.height}mm
- Roof Color: ${data.roofColor}
- Frame Color: ${data.postBeamColor}

3D DESIGN:
${screenshotUrl ? `Screenshot: ${screenshotUrl}` : "Screenshot not available"}
Interactive Design: ${designUrl}

QUICK ACTIONS:
- Reply to customer: ${data.customerEmail}
- View 3D design: ${designUrl}

FOLLOW-UP REQUIRED:
Please contact this customer within 24 hours for optimal conversion rates.

Generated by Gazi OGUTCU 2025
  `.trim()

  // Check if Resend is configured
  if (!config.RESEND_API_KEY) {
    console.log("⚠️ RESEND_API_KEY not configured")
    return { sent: false, error: "Email service not configured" }
  }

  // Send email to sales team
  try {
    const resend = new Resend(config.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: "Aussie Patio Inquiries <onboarding@resend.dev>",
      to: salesTeamEmails,
      subject: subject,
      text: textContent,
      html: htmlContent,
    })

    console.log("✅ Sales team notification sent successfully:", result)
    return { sent: true }
  } catch (error) {
    console.error("❌ Error sending sales team notification:", error)
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" }
  }
}

// Main function to process inquiry submission
export async function sendGazeboInquiry(data: InquiryData) {
  console.log("🚀 Processing patio/gazebo inquiry for:", data.customerEmail)

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

    // Send notification to sales team
    const salesEmailResult = await sendSalesTeamNotification(data, inquiryId, screenshotUrl)
    if (salesEmailResult.sent) {
      console.log("📧 Sales team notified successfully")
    } else {
      console.warn("⚠️ Failed to notify sales team:", salesEmailResult.error)
    }

    // Send confirmation email to customer with screenshot
    const customerData = {
      ...data,
      screenshot: screenshotUrl, // Pass the screenshot URL to the customer email
    }
    const emailResult = await sendCustomerConfirmation(customerData, inquiryId)

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
