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

// Professional customer confirmation email
async function sendCustomerConfirmation(
  data: InquiryData,
  inquiryId?: number,
): Promise<{ sent: boolean; error?: string }> {
  const config = getEnvConfig()

  // Create the 3D design URL with inquiry parameters
  const designUrl = `${process.env.VERCEL_URL || "https://your-domain.vercel.app"}/?ref=${inquiryId}&design=true&roofType=${encodeURIComponent(data.roofType)}&roofCladding=${encodeURIComponent(data.roofCladding)}&roofPitch=${data.roofPitch}&length=${data.length}&width=${data.width}&height=${data.height}&roofColor=${encodeURIComponent(data.roofColor)}&postBeamColor=${encodeURIComponent(data.postBeamColor)}`

  const referenceNumber = inquiryId ? `#${inquiryId.toString().padStart(6, "0")}` : ""
  const subject = `Your Patio/Gazebo Design Inquiry Confirmation ${referenceNumber}`

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
          color: #1f2937;
          background-color: #f8fafc;
        }
        
        .email-container {
          max-width: 680px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          backdrop-filter: blur(10px);
        }
        
        .header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
        }
        
        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 400;
        }
        
        .reference-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 16px;
          backdrop-filter: blur(10px);
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 24px;
          font-weight: 500;
        }
        
        .message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 32px;
          line-height: 1.7;
        }
        
        .specs-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 32px 0;
          border: 1px solid #e2e8f0;
        }
        
        .specs-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        
        .specs-title::before {
          content: '🏗️';
          margin-right: 8px;
          font-size: 20px;
        }
        
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .spec-item {
          background: #ffffff;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .spec-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        
        .spec-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .design-section {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 12px;
          padding: 32px 24px;
          text-align: center;
          margin: 32px 0;
          border: 1px solid #a7f3d0;
        }
        
        .design-title {
          font-size: 20px;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 12px;
        }
        
        .design-subtitle {
          font-size: 16px;
          color: #047857;
          margin-bottom: 24px;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: #ffffff;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }
        
        .cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .design-link {
          font-size: 12px;
          color: #6b7280;
          word-break: break-all;
          margin-top: 12px;
        }
        
        .next-steps {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 32px 0;
          border: 1px solid #f59e0b;
        }
        
        .next-steps-title {
          font-size: 18px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }
        
        .next-steps-title::before {
          content: '⏱️';
          margin-right: 8px;
          font-size: 20px;
        }
        
        .next-steps-content {
          color: #78350f;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .footer {
          background: #f8fafc;
          padding: 32px 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          position: relative;
        }
        
        .footer-message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 16px;
        }
        
        .footer-signature {
          font-size: 16px;
          color: #1f2937;
          font-weight: 600;
        }
        
        .footer-credit {
          position: absolute;
          bottom: 12px;
          right: 20px;
          font-size: 11px;
          color: #9ca3af;
          font-weight: 400;
        }
        
        @media (max-width: 640px) {
          .email-container {
            margin: 0;
            border-radius: 0;
          }
          
          .content, .header {
            padding: 24px 20px;
          }
          
          .specs-grid {
            grid-template-columns: 1fr;
          }
          
          .footer-credit {
            position: static;
            text-align: center;
            margin-top: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="logo">🏗️</div>
            <h1>Thank You for Your Inquiry</h1>
            <p>Your patio/gazebo design request has been received</p>
            ${referenceNumber ? `<div class="reference-badge">Reference ${referenceNumber}</div>` : ""}
          </div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <div class="greeting">Dear ${data.customerName},</div>
          
          <div class="message">
            We're excited to help bring your patio/gazebo vision to life! Your custom design request has been successfully submitted and is now being processed by our expert team.
          </div>
          
          <!-- Design Specifications -->
          <div class="specs-section">
            <div class="specs-title">Your Design Specifications</div>
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
            <div class="design-title">🎨 View Your 3D Design</div>
            <div class="design-subtitle">Experience your patio/gazebo in interactive 3D</div>
            <a href="${designUrl}" class="cta-button">View Interactive Design</a>
            <div class="design-link">
              Share this link: <a href="${designUrl}" style="color: #059669;">${designUrl}</a>
            </div>
          </div>
          
          <!-- Next Steps -->
          <div class="next-steps">
            <div class="next-steps-title">What Happens Next?</div>
            <div class="next-steps-content">
              <strong>Our team will contact you within 24-48 hours</strong> to discuss your project in detail and provide you with a comprehensive quote. We'll review your specifications and may suggest optimizations to ensure the best outcome for your patio/gazebo project.
              <br><br>
              If you have any immediate questions or would like to make changes to your design, please reply to this email with your reference number.
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-message">Thank you for choosing us for your patio/gazebo project!</div>
          <div class="footer-signature">
            <strong>The Aussie Patio Design Team</strong>
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

We're excited to help bring your patio/gazebo vision to life! Your custom design request has been successfully submitted and is now being processed by our expert team.

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

Thank you for choosing us for your patio/gazebo project!

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

  // Sales team email addresses
  const salesTeamEmails = [process.env.SALES_EMAIL_1, process.env.SALES_EMAIL_2, process.env.SALES_EMAIL_3].filter(
    (email) => email && email.trim() !== "",
  )

  if (salesTeamEmails.length === 0) {
    console.log("⚠️ No sales team emails configured in environment variables")
    return { sent: false, error: "No sales team emails configured" }
  }

  const referenceNumber = inquiryId ? `#${inquiryId.toString().padStart(6, "0")}` : "N/A"
  const designUrl = `${process.env.VERCEL_URL || "https://your-domain.vercel.app"}/?ref=${inquiryId}&design=true&roofType=${encodeURIComponent(data.roofType)}&roofCladding=${encodeURIComponent(data.roofCladding)}&roofPitch=${data.roofPitch}&length=${data.length}&width=${data.width}&height=${data.height}&roofColor=${encodeURIComponent(data.roofColor)}&postBeamColor=${encodeURIComponent(data.postBeamColor)}`

  const subject = `🚨 New Patio/Gazebo Inquiry ${referenceNumber} - ${data.customerName}`

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
          color: #1f2937;
          background-color: #f3f4f6;
        }
        
        .email-container {
          max-width: 800px;
          margin: 20px auto;
          background: #ffffff;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border-radius: 20px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
          padding: 32px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .alert-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
        }
        
        .header h1 {
          color: #ffffff;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
        }
        
        .header .reference {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          font-weight: 600;
        }
        
        .header .timestamp {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-top: 8px;
        }
        
        .content {
          padding: 40px;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 3px solid #e5e7eb;
        }
        
        .section-title .icon {
          margin-right: 12px;
          font-size: 24px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .info-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          word-break: break-word;
        }
        
        .email-link {
          color: #dc2626;
          text-decoration: none;
          font-weight: 600;
        }
        
        .email-link:hover {
          text-decoration: underline;
        }
        
        .specs-table {
          width: 100%;
          border-collapse: collapse;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .specs-table th {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          color: #ffffff;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .specs-table td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 15px;
          font-weight: 500;
        }
        
        .specs-table tr:last-child td {
          border-bottom: none;
        }
        
        .specs-table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .design-preview {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #10b981;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
        }
        
        .design-preview h3 {
          font-size: 22px;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 16px;
        }
        
        .screenshot {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          margin: 20px 0;
        }
        
        .action-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        
        .btn {
          display: inline-block;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          text-align: center;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          color: #ffffff;
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: #ffffff;
        }
        
        .btn-success {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: #ffffff;
        }
        
        .priority-banner {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 32px 0;
          text-align: center;
        }
        
        .priority-banner h3 {
          color: #92400e;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .priority-banner p {
          color: #78350f;
          font-size: 15px;
          font-weight: 500;
        }
        
        .footer {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 32px 40px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          position: relative;
        }
        
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .footer-credit {
          position: absolute;
          bottom: 16px;
          right: 24px;
          font-size: 11px;
          color: #9ca3af;
          font-weight: 400;
        }
        
        @media (max-width: 768px) {
          .email-container {
            margin: 10px;
            border-radius: 12px;
          }
          
          .content, .header {
            padding: 24px 20px;
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
          
          .footer-credit {
            position: static;
            text-align: center;
            margin-top: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="alert-badge">🚨 New Inquiry</div>
            <h1>Patio/Gazebo Design Request</h1>
            <div class="reference">Reference: ${referenceNumber}</div>
            <div class="timestamp">Submitted: ${new Date().toLocaleString()}</div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Customer Information -->
          <div class="section">
            <div class="section-title">
              <span class="icon">👤</span>
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
              <span class="icon">🏗️</span>
              Patio/Gazebo Specifications
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
                  <td><strong>L:</strong> ${data.length}mm × <strong>W:</strong> ${data.width}mm × <strong>H:</strong> ${data.height}mm</td>
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
              <span class="icon">🎨</span>
              3D Design Preview
            </div>
            <div class="design-preview">
              <h3>Interactive 3D Design</h3>
              ${
                screenshotUrl
                  ? `<img src="${screenshotUrl}" alt="3D Patio/Gazebo Design" class="screenshot" />`
                  : `<p style="color: #6b7280; font-style: italic;">3D design screenshot not available</p>`
              }
              <div class="action-buttons">
                <a href="mailto:${data.customerEmail}?subject=Re: Your Patio/Gazebo Inquiry ${referenceNumber}&body=Dear ${data.customerName},%0D%0A%0D%0AThank you for your patio/gazebo inquiry. We have reviewed your requirements and would like to discuss your project further.%0D%0A%0D%0ABest regards,%0D%0AThe Sales Team" class="btn btn-primary">
                  📧 Reply to Customer
                </a>
                <a href="${designUrl}" class="btn btn-success">
                  🔗 View 3D Design
                </a>
                <a href="tel:${data.customerEmail}" class="btn btn-secondary">
                  📞 Contact Customer
                </a>
              </div>
            </div>
          </div>
          
          <!-- Priority Banner -->
          <div class="priority-banner">
            <h3>⏰ Follow-up Required</h3>
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
🚨 NEW PATIO/GAZEBO INQUIRY ${referenceNumber}
Submitted: ${new Date().toLocaleString()}

👤 CUSTOMER INFORMATION:
- Name: ${data.customerName}
- Email: ${data.customerEmail}
- Installation Address: ${data.siteAddress}

🏗️ PATIO/GAZEBO SPECIFICATIONS:
- Roof Type: ${data.roofType}
- Roof Cladding: ${data.roofCladding}
- Roof Pitch: ${data.roofPitch}°
- Dimensions: ${data.length}mm × ${data.width}mm × ${data.height}mm
- Roof Color: ${data.roofColor}
- Frame Color: ${data.postBeamColor}

🎨 3D DESIGN:
${screenshotUrl ? `Screenshot: ${screenshotUrl}` : "Screenshot not available"}
Interactive Design: ${designUrl}

⚡ QUICK ACTIONS:
- Reply to customer: ${data.customerEmail}
- View 3D design: ${designUrl}

⏰ FOLLOW-UP REQUIRED:
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
