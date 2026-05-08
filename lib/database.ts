"use server"

import { neon } from "@neondatabase/serverless"
import { getEnvConfig } from "./env-config"

// Create database connection with error handling
const config = getEnvConfig()
const sql = config.DATABASE_URL ? neon(config.DATABASE_URL) : null

export interface GazeboInquiry {
  id?: number
  customer_name: string
  customer_email: string
  customer_phone: string
  site_address: string
  additional_details?: string
  roof_type: string
  roof_cladding: string
  roof_pitch: number
  length: number
  width: number
  height: number
  has_overhang: boolean
  overhang_sides: string[]
  overhang_size: number
  roof_color: string
  post_beam_color: string
  screenshot_url?: string
  created_at?: Date
  status?: "new" | "contacted" | "quoted" | "completed" | "cancelled"
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    if (!sql) {
      return { success: false, error: "Database not configured" }
    }

    // Create gazebo_inquiries table
    await sql`
      CREATE TABLE IF NOT EXISTS gazebo_inquiries (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) DEFAULT '',
        site_address TEXT NOT NULL,
        additional_details TEXT,
        roof_type VARCHAR(50) NOT NULL,
        roof_cladding VARCHAR(100) NOT NULL,
        roof_pitch DECIMAL(4,2) NOT NULL,
        length INTEGER NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        has_overhang BOOLEAN DEFAULT FALSE,
        overhang_sides TEXT[],
        overhang_size INTEGER DEFAULT 0,
        roof_color VARCHAR(100),
        post_beam_color VARCHAR(100),
        screenshot_url TEXT,
        agent_email VARCHAR(255),
        agent_company VARCHAR(255),
        source_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Keep older databases compatible with the current quote form.
    await sql`ALTER TABLE gazebo_inquiries ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) DEFAULT ''`
    await sql`ALTER TABLE gazebo_inquiries ADD COLUMN IF NOT EXISTS additional_details TEXT`
    await sql`ALTER TABLE gazebo_inquiries ADD COLUMN IF NOT EXISTS agent_email VARCHAR(255)`
    await sql`ALTER TABLE gazebo_inquiries ADD COLUMN IF NOT EXISTS agent_company VARCHAR(255)`
    await sql`ALTER TABLE gazebo_inquiries ADD COLUMN IF NOT EXISTS source_url VARCHAR(500)`

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_email ON gazebo_inquiries(customer_email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_phone ON gazebo_inquiries(customer_phone)`
    await sql`CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_status ON gazebo_inquiries(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_created_at ON gazebo_inquiries(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_agent_email ON gazebo_inquiries(agent_email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_source_url ON gazebo_inquiries(source_url)`

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create a new inquiry
export async function createInquiry(inquiry: Omit<GazeboInquiry, "id" | "created_at">) {
  try {
    if (!sql) {
      return { success: false, error: "Database not configured" }
    }

    const result = await sql`
      INSERT INTO gazebo_inquiries (
        customer_name, customer_email, customer_phone, site_address, additional_details,
        roof_type, roof_cladding, roof_pitch, length, width, height, has_overhang,
        overhang_sides, overhang_size, roof_color, post_beam_color, screenshot_url, status
      ) VALUES (
        ${inquiry.customer_name}, ${inquiry.customer_email}, ${inquiry.customer_phone || ""},
        ${inquiry.site_address}, ${inquiry.additional_details || null}, ${inquiry.roof_type},
        ${inquiry.roof_cladding}, ${inquiry.roof_pitch}, ${inquiry.length}, ${inquiry.width},
        ${inquiry.height}, ${inquiry.has_overhang ?? false}, ${inquiry.overhang_sides || []},
        ${inquiry.overhang_size ?? 0}, ${inquiry.roof_color}, ${inquiry.post_beam_color},
        ${inquiry.screenshot_url || null}, ${inquiry.status || "new"}
      )
      RETURNING id
    `

    const inquiryId = result[0]?.id
    return { success: true, id: inquiryId }
  } catch (error) {
    console.error("Error creating inquiry:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get all inquiries with pagination
export async function getInquiries(page = 1, limit = 10, status?: string) {
  try {
    if (!sql) {
      return { success: false, error: "Database not configured" }
    }

    const offset = (page - 1) * limit

    // Build query based on status filter
    const whereClause = status && status !== "all" ? sql`WHERE status = ${status}` : sql``

    // Get inquiries with pagination
    const inquiries = await sql`
      SELECT * FROM gazebo_inquiries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM gazebo_inquiries
      ${whereClause}
    `

    const total = Number(countResult[0]?.total || 0)

    return {
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching inquiries:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get inquiry statistics
export async function getInquiryStats() {
  try {
    if (!sql) {
      return { success: false, error: "Database not configured" }
    }

    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_inquiries,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'quoted' THEN 1 END) as quoted,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as this_month
      FROM gazebo_inquiries
    `

    return { success: true, stats: result[0] }
  } catch (error) {
    console.error("Error fetching inquiry stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    if (!sql) {
      return { success: false, error: "Database not configured" }
    }

    await sql`SELECT 1`
    return { success: true }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
