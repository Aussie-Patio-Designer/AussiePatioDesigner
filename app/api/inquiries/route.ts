import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { GazeboInquiryEmail } from "../../../emails/gazebo-inquiry"

const inquirySchema = z.object({
  customer_name: z.string().min(2).max(50),
  customer_email: z.string().email(),
  customer_phone: z.string().min(8).max(20),
  site_address: z.string().min(5).max(255),
  additional_details: z.string().max(1000).optional(),
  roof_type: z.string().min(3).max(50),
  roof_cladding: z.string().min(3).max(50),
  roof_pitch: z.string().min(1).max(50),
  length: z.string().min(1).max(50),
  width: z.string().min(1).max(50),
  height: z.string().min(1).max(50),
  has_overhang: z.boolean(),
  overhang_sides: z.string().max(255),
  overhang_size: z.string().min(1).max(50),
  roof_color: z.string().min(3).max(50),
  post_beam_color: z.string().min(3).max(50),
  screenshot_url: z.string().url().optional(),
})

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendGazeboInquiry(data: any) {
  try {
    const dataResult = await resend.emails.send({
      from: `Aussie Patio Designer <hello@aussiepatiodesigner.com>`,
      to: [data.recipientEmail],
      bcc: ["hello@aussiepatiodesigner.com"],
      subject: `New Gazebo Inquiry from ${data.customer_name}`,
      react: GazeboInquiryEmail(data),
    })

    return { success: true, data: dataResult }
  } catch (error) {
    console.error(error)
    return { success: false, error }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validatedData = inquirySchema.safeParse(body)

    if (!validatedData.success) {
      console.log(validatedData.error)
      return NextResponse.json({ errors: validatedData.error.flatten().fieldErrors }, { status: 400 })
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      site_address,
      additional_details,
      roof_type,
      roof_cladding,
      roof_pitch,
      length,
      width,
      height,
      has_overhang,
      overhang_sides,
      overhang_size,
      roof_color,
      post_beam_color,
      screenshot_url,
    } = validatedData.data

    // Get agent information if this is from an agent page
    let agentInfo = null
    const referer = request.headers.get("referer")
    const userAgent = request.headers.get("user-agent")

    if (referer) {
      const url = new URL(referer)
      const pathSegments = url.pathname.split("/").filter(Boolean)

      if (pathSegments.length === 1) {
        // This might be an agent URL
        const agentSlug = pathSegments[0]

        try {
          const agentResult = await sql`
            SELECT email, company_name 
            FROM agents 
            WHERE url_slug = ${agentSlug} 
            AND status = 'active'
            LIMIT 1
          `

          if (agentResult.length > 0) {
            agentInfo = agentResult[0]
          }
        } catch (error) {
          console.log("Could not fetch agent info:", error)
        }
      }
    }

    // Create the inquiry with agent tracking
    const result = await sql`
      INSERT INTO gazebo_inquiries (
        customer_name, customer_email, customer_phone, site_address, additional_details,
        roof_type, roof_cladding, roof_pitch, length, width, height, has_overhang, 
        overhang_sides, overhang_size, roof_color, post_beam_color, screenshot_url, 
        status, agent_email, agent_company, source_url
      ) VALUES (
        ${customer_name}, ${customer_email}, ${customer_phone}, 
        ${site_address}, ${additional_details || null}, ${roof_type}, 
        ${roof_cladding}, ${roof_pitch}, ${length}, ${width}, 
        ${height}, ${has_overhang}, ${overhang_sides}, 
        ${overhang_size}, ${roof_color}, ${post_beam_color}, 
        ${screenshot_url || null}, 'new',
        ${agentInfo?.email || null},
        ${agentInfo?.company_name || null},
        ${referer || "https://aussie-patio-designer.vercel.app"}
      )
      RETURNING id, created_at
    `

    const inquiryData = {
      id: result[0].id,
      customer_name,
      customer_email,
      customer_phone,
      site_address,
      additional_details,
      roof_type,
      roof_cladding,
      roof_pitch,
      length,
      width,
      height,
      has_overhang,
      overhang_sides,
      overhang_size,
      roof_color,
      post_beam_color,
      screenshot_url,
      created_at: result[0].created_at,
    }

    // Send email to appropriate recipient
    const recipientEmail = agentInfo?.email || process.env.SALES_EMAIL_1 || "sales@example.com"
    const companyName = agentInfo?.company_name || "Aussie Patio Designer"

    const emailResult = await sendGazeboInquiry({
      ...inquiryData,
      recipientEmail,
      companyName,
      isAgentInquiry: !!agentInfo,
    })

    if (emailResult.success) {
      return NextResponse.json({ message: "Inquiry created and email sent", inquiry: result[0] }, { status: 201 })
    } else {
      console.error("Error sending email:", emailResult.error)
      return NextResponse.json(
        { message: "Inquiry created, but email failed to send", inquiry: result[0], emailError: emailResult.error },
        { status: 201 },
      )
    }
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ message: "Error creating inquiry", error: error.message }, { status: 500 })
  }
}
