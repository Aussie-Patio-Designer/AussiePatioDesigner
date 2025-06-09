import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

interface AgentInfo {
  id: number
  company_name: string
  contact_name: string
  email: string
  url_slug: string
  fallback_email_index?: number
  status: string
}

interface EmailRoutingResult {
  primaryEmail: string
  fallbackEmail?: string
  agentInfo?: AgentInfo
  isAgentInquiry: boolean
  companyName: string
  routingMethod: "agent_database" | "fallback_email" | "default_sales"
}

/**
 * Get all available sales email environment variables
 * Returns array of emails from SALES_EMAIL_1, SALES_EMAIL_2, etc.
 */
function getAllSalesEmails(): string[] {
  const salesEmails: string[] = []
  let index = 1

  // Keep checking for SALES_EMAIL_X until we don't find one
  while (true) {
    const emailKey = `SALES_EMAIL_${index}`
    const email = process.env[emailKey]

    if (!email || email.trim() === "") {
      break // No more emails found
    }

    salesEmails.push(email.trim())
    index++
  }

  console.log(`📧 Found ${salesEmails.length} sales emails in environment variables`)
  return salesEmails
}

/**
 * Get fallback email by index (1-based)
 * SALES_EMAIL_1 = index 1, SALES_EMAIL_2 = index 2, etc.
 */
function getFallbackEmailByIndex(index: number): string | null {
  if (index < 1) return null

  const emailKey = `SALES_EMAIL_${index}`
  const email = process.env[emailKey]

  return email && email.trim() !== "" ? email.trim() : null
}

/**
 * Assign next available fallback email to a new agent
 * Returns the index of the assigned email (1-based)
 */
async function assignNextFallbackEmail(): Promise<number | null> {
  try {
    // Get all sales emails from environment
    const allSalesEmails = getAllSalesEmails()

    if (allSalesEmails.length === 0) {
      console.warn("⚠️ No sales emails configured in environment variables")
      return null
    }

    // Get all agents with their fallback email indices
    const agents = await sql`
      SELECT fallback_email_index 
      FROM agents 
      WHERE fallback_email_index IS NOT NULL 
      AND status = 'active'
      ORDER BY fallback_email_index
    `

    const usedIndices = agents.map((agent) => agent.fallback_email_index).filter(Boolean)

    // Find the next available index
    for (let i = 1; i <= allSalesEmails.length; i++) {
      if (!usedIndices.includes(i)) {
        console.log(`📧 Assigning fallback email index ${i} (${process.env[`SALES_EMAIL_${i}`]})`)
        return i
      }
    }

    // If all are used, assign to the last available email
    const lastIndex = allSalesEmails.length
    console.log(`⚠️ All fallback emails are assigned, using last one: index ${lastIndex}`)
    return lastIndex
  } catch (error) {
    console.error("❌ Error assigning fallback email:", error)
    return null
  }
}

/**
 * Route email based on agent slug or fallback system
 */
export async function routeInquiryEmail(agentSlug?: string, sourceUrl?: string): Promise<EmailRoutingResult> {
  console.log("🎯 ROUTING EMAIL - Agent Slug:", agentSlug, "Source URL:", sourceUrl)

  try {
    // Method 1: Try to find agent by slug in database
    if (agentSlug) {
      const agents = await sql`
        SELECT id, company_name, contact_name, email, url_slug, fallback_email_index, status
        FROM agents 
        WHERE url_slug = ${agentSlug} 
        AND status = 'active'
        LIMIT 1
      `

      if (agents.length > 0) {
        const agent = agents[0] as AgentInfo

        // Check if agent has a fallback email configured
        let fallbackEmail: string | undefined
        if (agent.fallback_email_index) {
          fallbackEmail = getFallbackEmailByIndex(agent.fallback_email_index) || undefined
        }

        console.log("✅ AGENT FOUND IN DATABASE:", {
          company: agent.company_name,
          email: agent.email,
          fallbackIndex: agent.fallback_email_index,
          fallbackEmail,
        })

        return {
          primaryEmail: agent.email,
          fallbackEmail,
          agentInfo: agent,
          isAgentInquiry: true,
          companyName: agent.company_name,
          routingMethod: "agent_database",
        }
      }
    }

    // Method 2: Try to match agent slug to fallback email pattern
    if (agentSlug) {
      // Check if slug matches a pattern like "agent-2", "lockyer-sheds", etc.
      const salesEmails = getAllSalesEmails()

      // Try to find a matching pattern or assign based on slug
      for (let i = 0; i < salesEmails.length; i++) {
        const emailIndex = i + 1 // 1-based indexing
        const email = salesEmails[i]

        // You can add custom logic here to match slugs to specific emails
        // For now, we'll use a simple approach

        if (agentSlug.includes(`-${emailIndex}`) || agentSlug === `agent-${emailIndex}`) {
          console.log(`🎯 MATCHED SLUG TO FALLBACK EMAIL: ${agentSlug} -> SALES_EMAIL_${emailIndex}`)

          return {
            primaryEmail: email,
            fallbackEmail: undefined,
            agentInfo: undefined,
            isAgentInquiry: true,
            companyName: `Agent ${emailIndex} (${agentSlug})`,
            routingMethod: "fallback_email",
          }
        }
      }
    }

    // Method 3: Default to first sales email
    const defaultEmail = process.env.SALES_EMAIL_1
    if (!defaultEmail) {
      throw new Error("No SALES_EMAIL_1 configured as fallback")
    }

    console.log("📧 USING DEFAULT SALES EMAIL:", defaultEmail)

    return {
      primaryEmail: defaultEmail,
      fallbackEmail: undefined,
      agentInfo: undefined,
      isAgentInquiry: false,
      companyName: "Aussie Patio Designer",
      routingMethod: "default_sales",
    }
  } catch (error) {
    console.error("❌ Error in email routing:", error)

    // Emergency fallback
    const emergencyEmail = process.env.SALES_EMAIL_1 || "sales@example.com"
    return {
      primaryEmail: emergencyEmail,
      fallbackEmail: undefined,
      agentInfo: undefined,
      isAgentInquiry: false,
      companyName: "Aussie Patio Designer",
      routingMethod: "default_sales",
    }
  }
}

/**
 * Create a new agent and assign fallback email
 */
export async function createAgentWithFallback(agentData: {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  website?: string
  logo_url?: string
  url_slug: string
  subscription_type?: string
}): Promise<{ success: boolean; agent?: any; fallbackEmailIndex?: number; error?: string }> {
  try {
    // Assign next available fallback email
    const fallbackEmailIndex = await assignNextFallbackEmail()

    if (!fallbackEmailIndex) {
      return {
        success: false,
        error: "No fallback emails available. Please configure more SALES_EMAIL_X environment variables.",
      }
    }

    const fallbackEmail = getFallbackEmailByIndex(fallbackEmailIndex)

    // Create agent with fallback email index
    const result = await sql`
      INSERT INTO agents (
        company_name, contact_name, email, phone, website,
        logo_url, url_slug, subscription_type, status, fallback_email_index
      ) VALUES (
        ${agentData.company_name}, 
        ${agentData.contact_name}, 
        ${agentData.email},
        ${agentData.phone || null}, 
        ${agentData.website || null}, 
        ${agentData.logo_url || null},
        ${agentData.url_slug}, 
        ${agentData.subscription_type || "basic"}, 
        'active',
        ${fallbackEmailIndex}
      )
      RETURNING id, company_name, url_slug, email, fallback_email_index
    `

    const agent = result[0]

    console.log("✅ AGENT CREATED WITH FALLBACK:", {
      id: agent.id,
      company: agent.company_name,
      email: agent.email,
      fallbackIndex: fallbackEmailIndex,
      fallbackEmail,
    })

    return {
      success: true,
      agent: {
        ...agent,
        fallback_email: fallbackEmail,
        customer_url: `https://aussie-patio-designer.vercel.app/${agent.url_slug}`,
      },
      fallbackEmailIndex,
    }
  } catch (error) {
    console.error("❌ Error creating agent with fallback:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get agent statistics including fallback email usage
 */
export async function getAgentEmailStats(): Promise<{
  totalSalesEmails: number
  usedFallbackEmails: number
  availableFallbackEmails: number
  agentsByFallback: Array<{ index: number; email: string; agents: AgentInfo[] }>
}> {
  try {
    const allSalesEmails = getAllSalesEmails()

    // Get all agents with their fallback indices
    const agents = (await sql`
      SELECT id, company_name, contact_name, email, url_slug, fallback_email_index, status
      FROM agents 
      WHERE status = 'active'
      ORDER BY fallback_email_index, company_name
    `) as AgentInfo[]

    // Group agents by fallback email index
    const agentsByFallback: Array<{ index: number; email: string; agents: AgentInfo[] }> = []

    for (let i = 1; i <= allSalesEmails.length; i++) {
      const email = allSalesEmails[i - 1]
      const agentsForThisEmail = agents.filter((agent) => agent.fallback_email_index === i)

      agentsByFallback.push({
        index: i,
        email,
        agents: agentsForThisEmail,
      })
    }

    const usedIndices = [...new Set(agents.map((agent) => agent.fallback_email_index).filter(Boolean))]

    return {
      totalSalesEmails: allSalesEmails.length,
      usedFallbackEmails: usedIndices.length,
      availableFallbackEmails: allSalesEmails.length - usedIndices.length,
      agentsByFallback,
    }
  } catch (error) {
    console.error("❌ Error getting agent email stats:", error)
    return {
      totalSalesEmails: 0,
      usedFallbackEmails: 0,
      availableFallbackEmails: 0,
      agentsByFallback: [],
    }
  }
}

export { getAllSalesEmails, getFallbackEmailByIndex, assignNextFallbackEmail }
