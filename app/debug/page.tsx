"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"

export default function DebugPage() {
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchEnvData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-env")
      const data = await response.json()
      setEnvData(data)
    } catch (error) {
      console.error("Error fetching environment data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvData()
  }, [])

  const getStatusBadge = (hasVar: boolean, varName: string) => {
    const isCritical = ["has_DATABASE_URL", "has_POSTGRES_URL", "has_ADMIN_USERNAME", "has_ADMIN_PASSWORD"].includes(
      varName,
    )

    if (hasVar) {
      return <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
    } else if (isCritical) {
      return <Badge className="bg-red-100 text-red-800">✗ Missing (Critical)</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">⚠ Missing (Optional)</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environment Debug</h1>
          <p className="text-gray-600">Debug environment variable configuration</p>
        </div>

        <div className="mb-6">
          <Button onClick={fetchEnvData} disabled={loading} className="flex items-center space-x-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {envData && (
          <div className="grid gap-6">
            {/* Environment Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Environment:</span>
                    <p className="font-semibold">{envData.environment.VERCEL_ENV || "development"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Platform:</span>
                    <p className="font-semibold">{envData.environment.VERCEL ? "Vercel" : "Local"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Env Vars:</span>
                    <p className="font-semibold">{envData.environment.total_env_vars}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Critical Environment Variables</span>
                  {envData.environment.has_DATABASE_URL || envData.environment.has_POSTGRES_URL ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Database Connection</span>
                    {getStatusBadge(
                      envData.environment.has_DATABASE_URL || envData.environment.has_POSTGRES_URL,
                      "has_DATABASE_URL",
                    )}
                  </div>
                  {envData.environment.DATABASE_URL_prefix !== "NOT_SET" && (
                    <div className="text-sm text-gray-600 ml-4">
                      DATABASE_URL: {envData.environment.DATABASE_URL_prefix}
                    </div>
                  )}
                  {envData.environment.POSTGRES_URL_prefix !== "NOT_SET" && (
                    <div className="text-sm text-gray-600 ml-4">
                      POSTGRES_URL: {envData.environment.POSTGRES_URL_prefix}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Admin Username</span>
                    {getStatusBadge(envData.environment.has_ADMIN_USERNAME, "has_ADMIN_USERNAME")}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Admin Password</span>
                    {getStatusBadge(envData.environment.has_ADMIN_PASSWORD, "has_ADMIN_PASSWORD")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optional Variables */}
            <Card>
              <CardHeader>
                <CardTitle>Optional Environment Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email Service (Resend)</span>
                    {getStatusBadge(envData.environment.has_RESEND_API_KEY, "has_RESEND_API_KEY")}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Blob Storage (Screenshots)</span>
                    {getStatusBadge(envData.environment.has_BLOB_READ_WRITE_TOKEN, "has_BLOB_READ_WRITE_TOKEN")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Fix Missing Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!envData.environment.has_DATABASE_URL && !envData.environment.has_POSTGRES_URL && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Database Not Configured</h4>
                      <p className="text-red-700 text-sm">
                        Your database connection is not configured. This will cause the application to fail. Please add
                        your Neon database URL to the environment variables.
                      </p>
                    </div>
                  )}

                  {!envData.environment.has_ADMIN_USERNAME && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Admin Username Missing</h4>
                      <p className="text-red-700 text-sm">
                        Set ADMIN_USERNAME environment variable to secure the admin dashboard.
                      </p>
                    </div>
                  )}

                  {!envData.environment.has_ADMIN_PASSWORD && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Admin Password Missing</h4>
                      <p className="text-red-700 text-sm">
                        Set ADMIN_PASSWORD environment variable to secure the admin dashboard.
                      </p>
                    </div>
                  )}

                  {!envData.environment.has_RESEND_API_KEY && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠ Email Service Not Configured</h4>
                      <p className="text-yellow-700 text-sm">
                        Set RESEND_API_KEY to enable email notifications. Without this, emails will be logged to
                        console.
                      </p>
                    </div>
                  )}

                  {!envData.environment.has_BLOB_READ_WRITE_TOKEN && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠ Screenshot Storage Not Configured</h4>
                      <p className="text-yellow-700 text-sm">
                        Set BLOB_READ_WRITE_TOKEN to enable screenshot uploads. Without this, screenshots will be
                        skipped.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
