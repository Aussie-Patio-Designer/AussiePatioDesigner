"use server"

import { neon, neonConfig } from "@neondatabase/serverless"
import { getValidatedEnv } from "./env-validation"

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true

// Create optimized database connection with connection pooling
const env = getValidatedEnv()
const sql = neon(env.DATABASE_URL)

export interface GazeboInquiry {
  id?: number
  customer_name: string
  customer_email: string
  site_address: string
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

// Connection pool for better performance
class DatabasePool {
  private static instance: DatabasePool
  private connectionPromise: Promise<any> | null = null

  private constructor() {}

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool()
    }
    return DatabasePool.instance
  }

  async getConnection() {
    if (!this.connectionPromise) {
      this.connectionPromise = this.createConnection()
    }
    return this.connectionPromise
  }

  private async createConnection() {
    try {
      // Test connection
      await sql`SELECT 1`
      return sql
    } catch (error) {
      this.connectionPromise = null
      throw error
    }
  }
}

const dbPool = DatabasePool.getInstance()

// Optimized database operations with error handling and retries
export async function createInquiry(inquiry: Omit<GazeboInquiry, "id" | "created_at">) {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await dbPool.getConnection()

      const result = await connection`
        INSERT INTO gazebo_inquiries (
          customer_name, customer_email, site_address, roof_type, roof_cladding,
          roof_pitch, length, width, height, has_overhang, overhang_sides,
          overhang_size, roof_color, post_beam_color, screenshot_url, status
        ) VALUES (
          ${inquiry.customer_name}, ${inquiry.customer_email}, ${inquiry.site_address},
          ${inquiry.roof_type}, ${inquiry.roof_cladding}, ${inquiry.roof_pitch},
          ${inquiry.length}, ${inquiry.width}, ${inquiry.height}, ${inquiry.has_overhang},
          ${inquiry.overhang_sides}, ${inquiry.overhang_size}, ${inquiry.roof_color},
          ${inquiry.post_beam_color}, ${inquiry.screenshot_url || null}, ${inquiry.status || "new"}
        )
        RETURNING id, created_at
      `

      return {
        success: true,
        id: result[0]?.id,
        created_at: result[0]?.created_at,
      }
    } catch (error) {
      lastError = error as Error
      console.error(`Database attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Database operation failed after retries",
  }
}

// Optimized query with pagination and caching
export async function getInquiries(page = 1, limit = 10, status?: string) {
  try {
    const connection = await dbPool.getConnection()
    const offset = (page - 1) * limit

    // Use prepared statement equivalent for better performance
    const whereClause = status && status !== "all" ? connection`WHERE status = ${status}` : connection``

    // Parallel execution for better performance
    const [inquiries, countResult] = await Promise.all([
      connection`
        SELECT * FROM gazebo_inquiries
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      connection`
        SELECT COUNT(*) as total FROM gazebo_inquiries
        ${whereClause}
      `,
    ])

    const total = Number(countResult[0]?.total || 0)

    return {
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
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

// Cached statistics with TTL
let statsCache: { data: any; timestamp: number } | null = null
const STATS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getInquiryStats() {
  const now = Date.now()

  // Return cached data if still valid
  if (statsCache && now - statsCache.timestamp < STATS_CACHE_TTL) {
    return { success: true, stats: statsCache.data }
  }

  try {
    const connection = await dbPool.getConnection()

    const result = await connection`
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

    const stats = result[0]

    // Cache the results
    statsCache = {
      data: stats,
      timestamp: now,
    }

    return { success: true, stats }
  } catch (error) {
    console.error("Error fetching inquiry stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Health check with connection validation
export async function testDatabaseConnection() {
  try {
    const connection = await dbPool.getConnection()
    const start = Date.now()
    await connection`SELECT 1 as health_check`
    const duration = Date.now() - start

    return {
      success: true,
      latency: duration,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Database health check failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
