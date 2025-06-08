import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, confirm } = body

    if (confirm !== "CONFIRM_CLEANUP") {
      return NextResponse.json({ error: "Confirmation required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    let result = {}

    switch (action) {
      case "orphaned_inquiries":
        // Delete inquiries with agent emails that no longer exist
        const orphanedInquiries = await sql`
          DELETE FROM gazebo_inquiries 
          WHERE agent_email IS NOT NULL 
          AND agent_email NOT IN (
            SELECT email FROM agents WHERE status = 'active'
          )
          RETURNING id
        `
        result = {
          action: "Deleted orphaned inquiries",
          count: orphanedInquiries.length,
        }
        break

      case "old_inquiries":
        // Delete inquiries older than 1 year
        const oldInquiries = await sql`
          DELETE FROM gazebo_inquiries 
          WHERE created_at < NOW() - INTERVAL '1 year'
          AND status IN ('completed', 'cancelled')
          RETURNING id
        `
        result = {
          action: "Deleted old completed/cancelled inquiries",
          count: oldInquiries.length,
        }
        break

      case "inactive_agents":
        // Delete agents that have been inactive for 6+ months
        const inactiveAgents = await sql`
          DELETE FROM agents 
          WHERE status = 'inactive' 
          AND updated_at < NOW() - INTERVAL '6 months'
          RETURNING id, company_name
        `
        result = {
          action: "Deleted inactive agents",
          count: inactiveAgents.length,
          agents: inactiveAgents.map((a) => a.company_name),
        }
        break

      default:
        return NextResponse.json({ error: "Invalid cleanup action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Database cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
