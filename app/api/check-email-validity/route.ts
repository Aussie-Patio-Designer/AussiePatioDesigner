import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        valid: false,
        reason: "No email provided",
      })
    }

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        valid: false,
        reason: "Invalid email format",
      })
    }

    // Check for common test/fake domains
    const invalidDomains = ["example.com", "test.com", "domain.com", "email.com", "yourcompany.com", "company.com"]

    const domain = email.split("@")[1].toLowerCase()
    if (invalidDomains.includes(domain)) {
      return NextResponse.json({
        valid: false,
        reason: `Test/example domain '${domain}' not allowed`,
      })
    }

    // Check for common disposable email domains
    const disposableDomains = [
      "mailinator.com",
      "tempmail.com",
      "10minutemail.com",
      "guerrillamail.com",
      "sharklasers.com",
    ]

    if (disposableDomains.includes(domain)) {
      return NextResponse.json({
        valid: false,
        reason: `Disposable email domain '${domain}' not allowed`,
      })
    }

    // All checks passed
    return NextResponse.json({
      valid: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
