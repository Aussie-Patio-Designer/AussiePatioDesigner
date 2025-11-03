import { NextResponse } from "next/server"
import { MissingDatabaseUrlError, getSqlClient, type SqlClient } from "./neon-client"

export function resolveSqlClient(context: string): { sql: SqlClient } | { response: NextResponse } {
  try {
    return { sql: getSqlClient() }
  } catch (error) {
    console.error(`Database error while ${context}:`, error)

    if (error instanceof MissingDatabaseUrlError) {
      return { response: createMissingDbResponse() }
    }

    return {
      response: NextResponse.json(
        {
          success: false,
          error: "Failed to access the database",
        },
        { status: 500 },
      ),
    }
  }
}

export function createMissingDbResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "Database connection is not configured",
    },
    { status: 500 },
  )
}
