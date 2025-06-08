import { notFound } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { GazeboFormWrapper } from "@/components/gazebo-form-wrapper"
import Image from "next/image"
import Link from "next/link"

interface Agent {
  id: number
  company_name: string
  contact_name: string
  email: string
  phone: string
  website_url?: string
  logo_url?: string
  url_slug: string
  status: string
  created_at: string
}

async function getAgent(slug: string): Promise<Agent | null> {
  try {
    console.log(`🔍 Looking up agent with slug: "${slug}"`)
    const sql = neon(process.env.DATABASE_URL!)

    // First check if the agents table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'agents'
      );
    `

    const agentsTableExists = tableCheck[0]?.exists || false

    if (!agentsTableExists) {
      console.error("❌ Agents table does not exist in database")
      return null
    }

    // Get the agent with exact slug match and active status
    const agents = await sql`
      SELECT * FROM agents 
      WHERE url_slug = ${slug} 
      AND status = 'active'
      LIMIT 1
    `

    if (agents.length === 0) {
      console.log(`⚠️ No active agent found with slug: "${slug}"`)

      // For debugging: check if there's an agent with this slug but inactive
      const inactiveCheck = await sql`
        SELECT id, company_name, status FROM agents 
        WHERE url_slug = ${slug} 
        LIMIT 1
      `

      if (inactiveCheck.length > 0) {
        console.log(`ℹ️ Found agent with slug "${slug}" but status is: ${inactiveCheck[0].status}`)
      }

      // For debugging: check if there are similar slugs
      const similarCheck = await sql`
        SELECT id, url_slug, company_name, status FROM agents 
        WHERE lower(url_slug) LIKE ${`%${slug.toLowerCase()}%`}
        LIMIT 5
      `

      if (similarCheck.length > 0) {
        console.log(
          `ℹ️ Found similar agents:`,
          similarCheck.map((a) => `${a.url_slug} (${a.status})`),
        )
      }

      return null
    }

    console.log(`✅ Found active agent: ${agents[0].company_name} (${agents[0].email})`)
    return agents[0]
  } catch (error) {
    console.error("❌ Error fetching agent:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { agent: string } }) {
  const agent = await getAgent(params.agent)

  if (!agent) {
    return {
      title: "Agent Not Found - Aussie Patio Designer",
      description: "The requested agent page could not be found.",
    }
  }

  return {
    title: `${agent.company_name} - Patio & Gazebo Designer`,
    description: `Design your perfect patio or gazebo with ${agent.company_name}. Professional 3D design tool with instant quotes.`,
    openGraph: {
      title: `${agent.company_name} - Patio & Gazebo Designer`,
      description: `Design your perfect patio or gazebo with ${agent.company_name}`,
      images: agent.logo_url ? [agent.logo_url] : [],
    },
  }
}

export default async function AgentPage({ params }: { params: { agent: string } }) {
  const agent = await getAgent(params.agent)

  if (!agent) {
    notFound()
  }

  return (
    <div className="min-h-screen relative">
      {/* Agent Branding Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {agent.logo_url && (
                <div className="relative w-12 h-12">
                  <Image
                    src={agent.logo_url || "/placeholder.svg"}
                    alt={`${agent.company_name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{agent.company_name}</h1>
                <p className="text-sm text-gray-600">Professional Patio & Gazebo Design</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {agent.website_url && (
                <Link
                  href={agent.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Visit Website →
                </Link>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{agent.contact_name}</p>
                <p className="text-xs text-gray-600">{agent.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-20">
        <GazeboFormWrapper />
      </div>

      {/* Hidden agent data for form submission */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.AGENT_DATA = ${JSON.stringify({
            id: agent.id,
            company_name: agent.company_name,
            contact_name: agent.contact_name,
            email: agent.email,
            url_slug: agent.url_slug,
          })};`,
        }}
      />
    </div>
  )
}
