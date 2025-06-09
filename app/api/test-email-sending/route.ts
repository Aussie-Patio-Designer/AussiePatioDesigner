import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { isValidEmail } from "@/lib/email-verification"

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message } = await request.json()

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid email address: ${email}`,
        },
        { status: 400 },
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Resend API key not configured",
        },
        { status: 500 },
      )
    }

    // Send test email
    const resend = new Resend(process.env.RESEND_API_KEY)

    console.log(`🧪 Sending test email to: ${email}`)

    const result = await resend.emails.send({
      from: "Aussie Patio Inquiries <onboarding@resend.dev>",
      to: [email],
      subject: subject || "Test Email from Aussie Patio Designer",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Test Email</h1>
          <p style="font-size: 16px; line-height: 1.5;">${message || "This is a test email to verify email delivery."}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #666;">Sent from: Aussie Patio Designer</p>
            <p style="margin: 5px 0 0; color: #666;">Time: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    })

    console.log("✅ Test email result:", result)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      result,
    })
  } catch (error) {
    console.error("❌ Error sending test email:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
