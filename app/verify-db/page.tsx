"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VerificationResult {
  success: boolean
  message?: string
  error?: string
  details?: any
}

export default function VerifyDatabase() {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runVerification = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/verify-db")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to connect to verification endpoint",
        details: { error: error instanceof Error ? error.message : "Unknown error" },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Verification</h1>
          <p className="text-gray-600">Check if the agents table exists and is accessible</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agents Table Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runVerification} disabled={loading} className="mb-4">
              {loading ? "Verifying..." : "🔍 Verify Database"}
            </Button>

            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {result.success ? "✅ SUCCESS" : "❌ FAILED"}
                  </Badge>
                  <span className="font-medium">{result.message || result.error}</span>
                </div>

                {result.details && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Details:</h3>

                    {/* Database URL Status */}
                    <div className="mb-3">
                      <span className="font-medium">Database URL: </span>
                      <Badge
                        className={
                          result.details.database_url_configured
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {result.details.database_url_configured ? "✅ Configured" : "❌ Missing"}
                      </Badge>
                    </div>

                    {/* Table Exists */}
                    {typeof result.details.table_exists !== "undefined" && (
                      <div className="mb-3">
                        <span className="font-medium">Table Exists: </span>
                        <Badge
                          className={
                            result.details.table_exists ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {result.details.table_exists ? "✅ Yes" : "❌ No"}
                        </Badge>
                      </div>
                    )}

                    {/* Agent Count */}
                    {typeof result.details.agent_count !== "undefined" && (
                      <div className="mb-3">
                        <span className="font-medium">Agent Count: </span>
                        <Badge className="bg-blue-100 text-blue-800">{result.details.agent_count} agents</Badge>
                      </div>
                    )}

                    {/* Insert Test */}
                    {result.details.insert_test && (
                      <div className="mb-3">
                        <span className="font-medium">Insert Test: </span>
                        <Badge
                          className={
                            result.details.insert_test === "PASSED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {result.details.insert_test === "PASSED" ? "✅ PASSED" : "❌ FAILED"}
                        </Badge>
                      </div>
                    )}

                    {/* Table Structure */}
                    {result.details.table_structure && (
                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Table Structure:</h4>
                        <div className="bg-white p-3 rounded border text-sm">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-1">Column</th>
                                <th className="text-left p-1">Type</th>
                                <th className="text-left p-1">Nullable</th>
                                <th className="text-left p-1">Default</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.details.table_structure.map((col: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="p-1 font-mono">{col.column_name}</td>
                                  <td className="p-1">{col.data_type}</td>
                                  <td className="p-1">{col.is_nullable}</td>
                                  <td className="p-1 text-xs">{col.column_default || "NULL"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Sample Agents */}
                    {result.details.sample_agents && result.details.sample_agents.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Sample Agents:</h4>
                        <div className="bg-white p-3 rounded border text-sm">
                          {result.details.sample_agents.map((agent: any, idx: number) => (
                            <div key={idx} className="mb-2 p-2 border-b">
                              <div>
                                <strong>{agent.company_name}</strong> ({agent.contact_name})
                              </div>
                              <div className="text-gray-600">
                                {agent.email} | /{agent.url_slug}
                              </div>
                              <div className="text-xs text-gray-500">
                                Status: {agent.status} | Created: {new Date(agent.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Details */}
                    {result.details.error_message && (
                      <div className="mb-3">
                        <h4 className="font-medium mb-2 text-red-600">Error Details:</h4>
                        <div className="bg-red-50 p-3 rounded border border-red-200 text-sm text-red-700">
                          {result.details.error_message}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.details.suggestion && (
                      <div className="mb-3">
                        <h4 className="font-medium mb-2 text-orange-600">Suggestion:</h4>
                        <div className="bg-orange-50 p-3 rounded border border-orange-200 text-sm text-orange-700">
                          {result.details.suggestion}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" onClick={() => window.open("/admin", "_blank")}>
                🏢 Open Admin Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.open("/api/admin/agents", "_blank")}>
                📊 View Agents API
              </Button>
              <Button variant="outline" onClick={() => window.open("/status", "_blank")}>
                ⚡ System Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
