import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/database"
import { getEnvConfig } from "@/lib/env-config"

export async function GET() {
  const config = getEnvConfig()

  // Check database connection
  const dbStatus = await testDatabaseConnection()

  // Check environment variables
  const envStatus = {
    database: !!config.DATABASE_URL,
    email: !!config.RESEND_API_KEY,
    blobStorage: !!config.BLOB_READ_WRITE_TOKEN,
    adminAuth: !!config.ADMIN_USERNAME && !!config.ADMIN_PASSWORD,
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.IS_PRODUCTION ? "production" : "development",
    services: {
      database: {
        configured: envStatus.database,
        connected: dbStatus.success,
      },
      email: {
        configured: envStatus.email,
      },
      blobStorage: {
        configured: envStatus.blobStorage,
      },
      adminAuth: {
        configured: envStatus.adminAuth,
      },
    },
  })
}
