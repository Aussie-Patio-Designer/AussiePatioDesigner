import { neon } from "@neondatabase/serverless"

interface EmailRoutingResult {
  primaryEmail: string
  isAgentInquiry: boolean
  companyName: string
  routingMethod: "agent-database" | "agent-data" | "default-fallback"
  agentInfo?: {
    id: number
    company_name: string
    email: string
    url_slug: string
  }
}

/**
 * Simple email routing: Agent email if available, otherwise fallback to SALES_EMAIL_1
 */
export async function routeInquiryEmail(
  agentSlug?: string,
  sourceUrl?: string,
  agentData?: {
    email: string
    company_name: string
    url_slug?: string
  },
): Promise<EmailRoutingResult> {
  // Method 1: Use agent data if provided directly (from client)
  if (agentData && agentData.email) {
    console.log("🎯 Using agent data from client:", agentData.email)
    return {
      primaryEmail: agentData.email,
      isAgentInquiry: true,
      companyName: agentData.company_name,
      routingMethod: "agent-data",
      agentInfo: {
        id: 0, // Not available from client data
        company_name: agentData.company_name,
        email: agentData.email,
        url_slug: agentData.url_slug || "",
      },
    }
  }

  // Method 2: Look up agent in database by slug
  if (agentSlug) {
    try {
      const sql = neon(process.env.DATABASE_URL!)

      const agentResult = await sql`
        SELECT id, company_name, email, url_slug, status
        FROM agents 
        WHERE url_slug = ${agentSlug} 
        AND status = 'active'
        LIMIT 1
      `

      if (agentResult.length > 0) {
        const agent = agentResult[0]
        console.log("🎯 Found agent in database:", agent.email)
        return {
          primaryEmail: agent.email,
          isAgentInquiry: true,
          companyName: agent.company_name,
          routingMethod: "agent-database",
          agentInfo: {
            id: agent.id,
            company_name: agent.company_name,
            email: agent.email,
            url_slug: agent.url_slug,
          },
        }
      }
    } catch (error) {
      console.error("❌ Error looking up agent:", error)
    }
  }

  // Method 3: Extract agent slug from source URL if not provided
  if (!agentSlug && sourceUrl) {
    try {
      const url = new URL(sourceUrl)
      const pathSegments = url.pathname.split("/").filter(Boolean)

      // Check if this looks like an agent URL (single path segment, not admin/api/etc)
      if (pathSegments.length === 1 && !["admin", "api", "debug", "test"].includes(pathSegments[0])) {
        const extractedSlug = pathSegments[0]
        console.log("🔍 Extracted agent slug from URL:", extractedSlug)

        // Recursively call with the extracted slug
        return await routeInquiryEmail(extractedSlug, sourceUrl)
      }
    } catch (error) {
      console.error("❌ Error parsing source URL:", error)
    }
  }

  // Default fallback: Use SALES_EMAIL_1
  const fallbackEmail = process.env.SALES_EMAIL_1 || "gaziogutcu.go@gmail.com"
  console.log("📧 Using default fallback email:", fallbackEmail)

  return {
    primaryEmail: fallbackEmail,
    isAgentInquiry: false,
    companyName: "Aussie Patio Designer",
    routingMethod: "default-fallback",
  }
}

/**
 * Get available sales emails for admin purposes
 */
export function getAvailableSalesEmails(): string[] {
  const emails: string[] = []

  if (process.env.SALES_EMAIL_1) {
    emails.push(process.env.SALES_EMAIL_1)
  }

  return emails
}

/**
 * Validate email routing configuration
 */
export function validateEmailRouting(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!process.env.SALES_EMAIL_1) {
    errors.push("SALES_EMAIL_1 environment variable is required as fallback email")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
