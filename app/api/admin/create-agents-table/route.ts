import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("Creating agents table...")
    const sql = neon(process.env.DATABASE_URL!)

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agents'
      )
    `

    if (tableExists[0].exists) {
      return NextResponse.json({
        success: true,
        message: "Agents table already exists",
        action: "none",
      })
    }

    // Create the table
    await sql`
      CREATE TABLE agents (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        website VARCHAR(255),
        logo_url TEXT,
        url_slug VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        subscription_type VARCHAR(20) DEFAULT 'basic',
        subscription_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({
      success: true,
      message: "Agents table created successfully",
      action: "created",
    })
  } catch (error) {
    console.error("Error creating agents table:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
