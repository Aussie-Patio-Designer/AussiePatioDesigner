"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AgentEmailStats {
  totalSalesEmails: number
  usedFallbackEmails: number
  availableFallbackEmails: number
  agentsByFallback: Array<{
    index: number
    email: string
    agents: Array<{
      id: number
      company_name: string
      email: string
      url_slug: string
    }>
  }>
}

export default function EmailRoutingAdmin() {
  const [stats, setStats] = useState<AgentEmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/email-routing/stats")
      const data = await response.json()

      if (response.ok && data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || "Failed to fetch email routing stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError("Network error while fetching stats")
    } finally {
      setLoading(false)
    }
  }

  const testEmailRouting = async (agentSlug: string) => {
    try {
      const response = await fetch("/api/admin/email-routing/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentSlug }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(
          `✅ Email Routing Test Result:\n\nPrimary: ${result.primaryEmail}\nFallback: ${result.fallbackEmail || "None"}\nMethod: ${result.routingMethod}\nCompany: ${result.companyName}`,
        )
      } else {
        alert(`❌ Test failed: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Network error: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Email Routing Management</h1>
          <p className="text-gray-600 mt-1">Manage fallback emails and agent routing system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <Button onClick={fetchStats} className="mt-2" size="sm">
              Retry
            </Button>
          </div>
        )}

        {stats && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Sales Emails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSalesEmails}</div>
                  <p className="text-xs text-gray-500">Environment variables</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Used Fallbacks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.usedFallbackEmails}</div>
                  <p className="text-xs text-gray-500">Assigned to agents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.availableFallbackEmails}</div>
                  <p className="text-xs text-gray-500">Ready for new agents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((stats.usedFallbackEmails / stats.totalSalesEmails) * 100)}%
                  </div>
                  <p className="text-xs text-gray-500">Email slots used</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="routing" className="space-y-6">
              <TabsList>
                <TabsTrigger value="routing">Email Routing</TabsTrigger>
                <TabsTrigger value="testing">Test Routing</TabsTrigger>
              </TabsList>

              <TabsContent value="routing">
                <Card>
                  <CardHeader>
                    <CardTitle>Fallback Email Assignments</CardTitle>
                    <p className="text-sm text-gray-600">
                      Shows which agents are assigned to each SALES_EMAIL_X environment variable
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.agentsByFallback.map((fallback) => (
                        <div key={fallback.index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium">SALES_EMAIL_{fallback.index}</h3>
                              <p className="text-sm text-gray-600">{fallback.email}</p>
                            </div>
                            <Badge variant={fallback.agents.length > 0 ? "default" : "secondary"}>
                              {fallback.agents.length} agent{fallback.agents.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>

                          {fallback.agents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {fallback.agents.map((agent) => (
                                <div key={agent.id} className="bg-gray-50 rounded p-3">
                                  <div className="font-medium text-sm">{agent.company_name}</div>
                                  <div className="text-xs text-gray-600">{agent.email}</div>
                                  <div className="text-xs text-blue-600">/{agent.url_slug}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                              <p className="text-sm">Available for new agent assignment</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="testing">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Email Routing</CardTitle>
                    <p className="text-sm text-gray-600">Test how emails would be routed for different agent slugs</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.agentsByFallback.map((fallback) =>
                          fallback.agents.map((agent) => (
                            <div key={agent.id} className="border rounded p-3">
                              <div className="font-medium text-sm mb-2">{agent.company_name}</div>
                              <div className="text-xs text-gray-600 mb-2">/{agent.url_slug}</div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testEmailRouting(agent.url_slug)}
                                className="w-full"
                              >
                                Test Routing
                              </Button>
                            </div>
                          )),
                        )}
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Test Custom Slug</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter agent slug (e.g., lockyer-sheds)"
                            className="flex-1 px-3 py-2 border rounded"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const input = e.target as HTMLInputElement
                                testEmailRouting(input.value)
                              }
                            }}
                          />
                          <Button
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector(
                                "input",
                              ) as HTMLInputElement
                              if (input?.value) {
                                testEmailRouting(input.value)
                              }
                            }}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
