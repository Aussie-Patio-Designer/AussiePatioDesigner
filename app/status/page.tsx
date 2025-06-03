"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface StatusResponse {
  status: string
  timestamp: string
  environment: string
  services: {
    database: {
      configured: boolean
      connected: boolean
    }
    email: {
      configured: boolean
    }
    blobStorage: {
      configured: boolean
    }
    adminAuth: {
      configured: boolean
    }
  }
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Error fetching status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
          <p className="text-gray-600">Check the status of all system components</p>
        </div>

        <div className="mb-6">
          <Button onClick={fetchStatus} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Status</span>
          </Button>
        </div>

        {status && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <p className="font-semibold text-green-600">{status.status}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Environment:</span>
                    <p className="font-semibold">{status.environment}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <p className="font-semibold">{new Date(status.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Database</h3>
                      <p className="text-sm text-gray-600">
                        {status.services.database.configured
                          ? status.services.database.connected
                            ? "Connected and working"
                            : "Configured but not connected"
                          : "Not configured"}
                      </p>
                    </div>
                    {status.services.database.connected ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Email Service</h3>
                      <p className="text-sm text-gray-600">
                        {status.services.email.configured
                          ? "Configured and ready"
                          : "Not configured - emails will be logged"}
                      </p>
                    </div>
                    {status.services.email.configured ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Blob Storage</h3>
                      <p className="text-sm text-gray-600">
                        {status.services.blobStorage.configured
                          ? "Configured and ready"
                          : "Not configured - screenshots disabled"}
                      </p>
                    </div>
                    {status.services.blobStorage.configured ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Admin Authentication</h3>
                      <p className="text-sm text-gray-600">
                        {status.services.adminAuth.configured
                          ? "Configured and secure"
                          : "Not configured - admin access insecure"}
                      </p>
                    </div>
                    {status.services.adminAuth.configured ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
