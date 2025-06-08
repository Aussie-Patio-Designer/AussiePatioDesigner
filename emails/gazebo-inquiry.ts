import type { FormData } from "@/lib/types"

export interface GazeboInquiryEmailProps {
  formData: FormData
  agentCompany?: string
  customerUrl?: string
}

export function GazeboInquiryEmail({ formData, agentCompany, customerUrl }: GazeboInquiryEmailProps) {
  const { customerDetails, gazeboSpecs, colorSelection, environment, screenshotUrl } = formData

  const subject = agentCompany
    ? `New Gazebo Inquiry from ${customerDetails.name} via ${agentCompany}`
    : `New Gazebo Inquiry from ${customerDetails.name}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Gazebo Inquiry</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #2563eb; }
        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .spec-item { padding: 8px; background: #f8f9fa; border-radius: 4px; }
        .screenshot { text-align: center; margin: 20px 0; }
        .screenshot img { max-width: 100%; height: auto; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Gazebo Design Inquiry</h1>
          ${agentCompany ? `<p>Submitted via ${agentCompany}</p>` : ""}
        </div>

        <div class="section">
          <h2>Customer Information</h2>
          <p><strong>Name:</strong> ${customerDetails.name}</p>
          <p><strong>Email:</strong> ${customerDetails.email}</p>
          <p><strong>Phone:</strong> ${customerDetails.phone}</p>
          <p><strong>Address:</strong> ${customerDetails.address}</p>
          ${customerDetails.notes ? `<p><strong>Notes:</strong> ${customerDetails.notes}</p>` : ""}
        </div>

        <div class="section">
          <h2>Gazebo Specifications</h2>
          <div class="specs-grid">
            <div class="spec-item">
              <strong>Width:</strong> ${gazeboSpecs.width}m
            </div>
            <div class="spec-item">
              <strong>Length:</strong> ${gazeboSpecs.length}m
            </div>
            <div class="spec-item">
              <strong>Height:</strong> ${gazeboSpecs.height}m
            </div>
            <div class="spec-item">
              <strong>Roof Pitch:</strong> ${gazeboSpecs.roofPitch}°
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Color Selection</h2>
          <p><strong>Roof Color:</strong> ${colorSelection.roofColor}</p>
          <p><strong>Frame Color:</strong> ${colorSelection.frameColor}</p>
        </div>

        <div class="section">
          <h2>Environment</h2>
          <p><strong>Ground Type:</strong> ${environment.groundType}</p>
          <p><strong>Sky Type:</strong> ${environment.skyType}</p>
        </div>

        ${
          screenshotUrl
            ? `
          <div class="section">
            <h2>3D Design Preview</h2>
            <div class="screenshot">
              <img src="${screenshotUrl}" alt="Gazebo 3D Design" />
            </div>
          </div>
        `
            : ""
        }

        ${
          customerUrl
            ? `
          <div class="section">
            <h2>Design Source</h2>
            <p>This inquiry was submitted from: <a href="${customerUrl}">${customerUrl}</a></p>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>This inquiry was generated from the Aussie Patio Designer 3D configurator.</p>
          <p>Please respond to the customer within 24 hours for the best experience.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
New Gazebo Design Inquiry
${agentCompany ? `Submitted via ${agentCompany}` : ""}

Customer Information:
- Name: ${customerDetails.name}
- Email: ${customerDetails.email}
- Phone: ${customerDetails.phone}
- Address: ${customerDetails.address}
${customerDetails.notes ? `- Notes: ${customerDetails.notes}` : ""}

Gazebo Specifications:
- Dimensions: ${gazeboSpecs.width}m x ${gazeboSpecs.length}m x ${gazeboSpecs.height}m
- Roof Pitch: ${gazeboSpecs.roofPitch}°

Colors:
- Roof: ${colorSelection.roofColor}
- Frame: ${colorSelection.frameColor}

Environment:
- Ground: ${environment.groundType}
- Sky: ${environment.skyType}

${screenshotUrl ? `3D Preview: ${screenshotUrl}` : ""}
${customerUrl ? `Source: ${customerUrl}` : ""}

Please respond to the customer within 24 hours.
  `

  return {
    subject,
    html: htmlContent,
    text: textContent,
  }
}

// Export default for backward compatibility
export default GazeboInquiryEmail
