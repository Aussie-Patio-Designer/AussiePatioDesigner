import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendEmail } from "@/lib/email"
import { uploadScreenshot } from "@/lib/blob-storage"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Get agent information if agent_slug is provided
    let agentEmail = null
    let agentName = null

    if (data.agent_slug) {
      try {
        const agentResult = await sql`
          SELECT email, company_name FROM agents 
          WHERE url_slug = ${data.agent_slug} AND status = 'active'
          LIMIT 1
        `

        if (agentResult.length > 0) {
          agentEmail = agentResult[0].email
          agentName = agentResult[0].company_name
        }
      } catch (error) {
        console.error("Error fetching agent:", error)
        // Continue without agent info if there's an error
      }
    }

    // Upload screenshot if provided
    let screenshotUrl = null
    if (data.screenshot) {
      try {
        screenshotUrl = await uploadScreenshot(data.screenshot)
      } catch (error) {
        console.error("Error uploading screenshot:", error)
        // Continue without screenshot if upload fails
      }
    }

    // Insert inquiry into database
    const result = await sql`
      INSERT INTO inquiries (
        customer_name, customer_email, customer_phone, site_address,
        roof_type, roof_cladding, roof_pitch, length, width, height,
        has_overhang, overhang_sides, overhang_size, roof_color, post_beam_color,
        screenshot_url, agent_slug, agent_email, status
      ) VALUES (
        ${data.customer_name}, ${data.customer_email}, ${data.customer_phone || null}, ${data.site_address},
        ${data.roof_type}, ${data.roof_cladding}, ${data.roof_pitch}, ${data.length}, ${data.width}, ${data.height},
        ${data.has_overhang}, ${JSON.stringify(data.overhang_sides || [])}, ${data.overhang_size || 0},
        ${data.roof_color}, ${data.post_beam_color}, ${screenshotUrl}, ${data.agent_slug || null}, ${agentEmail}, 'new'
      )
      RETURNING id
    `

    const inquiryId = result[0].id

    // Send emails
    try {
      // Determine recipient email (agent email or default sales emails)
      const recipientEmails = agentEmail
        ? [agentEmail]
        : [process.env.SALES_EMAIL_1, process.env.SALES_EMAIL_2, process.env.SALES_EMAIL_3].filter(Boolean)

      // Send to sales team or agent
      for (const email of recipientEmails) {
        await sendEmail({
          to: email,
          subject: `New Gazebo Inquiry #${inquiryId.toString().padStart(6, "0")}${agentName ? ` - ${agentName}` : ""}`,
          html: `
            <h2>New Gazebo Design Inquiry</h2>
            <p><strong>Inquiry ID:</strong> #${inquiryId.toString().padStart(6, "0")}</p>
            ${agentName ? `<p><strong>Partner:</strong> ${agentName}</p>` : ""}
            
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${data.customer_name}</p>
            <p><strong>Email:</strong> ${data.customer_email}</p>
            ${data.customer_phone ? `<p><strong>Phone:</strong> ${data.customer_phone}</p>` : ""}
            <p><strong>Site Address:</strong> ${data.site_address}</p>
            
            <h3>Design Specifications</h3>
            <p><strong>Roof Type:</strong> ${data.roof_type}</p>
            <p><strong>Roof Cladding:</strong> ${data.roof_cladding}</p>
            <p><strong>Roof Pitch:</strong> ${data.roof_pitch}°</p>
            <p><strong>Dimensions:</strong> ${(data.length / 1000).toFixed(1)}m × ${(data.width / 1000).toFixed(1)}m × ${(data.height / 1000).toFixed(1)}m</p>
            <p><strong>Overhang:</strong> ${data.has_overhang ? `Yes (${data.overhang_size}mm on ${data.overhang_sides?.join(", ")})` : "No"}</p>
            <p><strong>Roof Color:</strong> ${data.roof_color}</p>
            <p><strong>Post/Beam Color:</strong> ${data.post_beam_color}</p>
            
            ${screenshotUrl ? `<p><strong>Design Screenshot:</strong> <a href="${screenshotUrl}">View Image</a></p>` : ""}
            
            <p>Please contact the customer to provide a quote and discuss their requirements.</p>
          `,
        })
      }

      // Send confirmation to customer
      await sendEmail({
        to: data.customer_email,
        subject: `Your Gazebo Design Inquiry #${inquiryId.toString().padStart(6, "0")}`,
        html: `
          <h2>Thank you for your gazebo design inquiry!</h2>
          <p>Dear ${data.customer_name},</p>
          <p>We've received your gazebo design inquiry and our team will contact you shortly with a detailed quote.</p>
          
          <p><strong>Your Inquiry ID:</strong> #${inquiryId.toString().padStart(6, "0")}</p>
          ${agentName ? `<p><strong>Partner:</strong> ${agentName}</p>` : ""}
          
          <h3>Your Design Summary</h3>
          <p><strong>Dimensions:</strong> ${(data.length / 1000).toFixed(1)}m × ${(data.width / 1000).toFixed(1)}m × ${(data.height / 1000).toFixed(1)}m</p>
          <p><strong>Roof Type:</strong> ${data.roof_type}</p>
          <p><strong>Roof Cladding:</strong> ${data.roof_cladding}</p>
          <p><strong>Colors:</strong> ${data.roof_color} roof, ${data.post_beam_color} posts/beams</p>
          
          ${screenshotUrl ? `<p><strong>Your Design:</strong> <a href="${screenshotUrl}">View Image</a></p>` : ""}
          
          <p>We'll be in touch within 24 hours to discuss your project in detail.</p>
          
          <p>Best regards,<br>
          ${agentName || "Aussie Patio Designer Team"}</p>
        `,
      })
    } catch (emailError) {
      console.error("Error sending emails:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiryId: inquiryId,
    })
  } catch (error) {
    console.error("Error processing inquiry:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process inquiry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
