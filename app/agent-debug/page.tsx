"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AgentDebug() {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [agentsList, setAgentsList] = useState<any>(null)
  const [createResult, setCreateResult] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_name: "Test Company",
    contact_name: "Test User",
    email: `test-${Date.now()}@example.com`,
    phone: "+61 400 000 000",
    website: "https://example.com",
    logo_url: "https://via.placeholder.com/200x80",
    url_slug: `test-company-${Date.now()}`,
    subscription_type: "basic",
  })

  // Check database status on load
  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    setLoading("db")
    try {
      const response = await fetch("/api/admin/verify-db")
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      setDbStatus({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(null)
    }
  }

  const fetchAgents = async () => {
    setLoading("agents")
    try {
      const response = await fetch("/api/admin/agents")
      const data = await response.json()
      setAgentsList(data)
    } catch (error) {
      setAgentsList({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(null)
    }
  }

  const createAgent = async () => {
    setLoading("create")
    setCreateResult(null)

    try {
      // Log the request data
      console.log("Sending agent data:", formData)

      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      // Get response as text first to debug any JSON parsing issues
      const responseText = await response.text()
      console.log("Raw response:", responseText)

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        data = {
          success: false,
          error: "Invalid JSON response",
          rawResponse: responseText,
        }
      }

      setCreateResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      })
    } catch (error) {
      console.error("Error creating agent:", error)
      setCreateResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">🔍 Agent System Debugging</CardTitle>
            <CardDescription>Comprehensive debugging tool for the agent management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-6">
              <Button onClick={checkDatabase} disabled={loading === "db"} variant="outline">
                {loading === "db" ? "Checking..." : "🔍 Check Database"}
              </Button>

              <Button onClick={fetchAgents} disabled={loading === "agents"} variant="outline">
                {loading === "agents" ? "Loading..." : "📋 List Agents"}
              </Button>

              <Button
                onClick={createAgent}
                disabled={loading === "create"}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading === "create" ? "Creating..." : "➕ Test Create Agent"}
              </Button>
            </div>

            <Tabs defaultValue="form">
              <TabsList className="mb-4">
                <TabsTrigger value="form">Test Form</TabsTrigger>
                <TabsTrigger value="db">Database Status</TabsTrigger>
                <TabsTrigger value="agents">Agents List</TabsTrigger>
                <TabsTrigger value="result">Create Result</TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={formData.website} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input id="logo_url" name="logo_url" value={formData.logo_url} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="url_slug">URL Slug</Label>
                    <Input id="url_slug" name="url_slug" value={formData.url_slug} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="subscription_type">Subscription Type</Label>
                    <Input
                      id="subscription_type"
                      name="subscription_type"
                      value={formData.subscription_type}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Button
                  onClick={createAgent}
                  disabled={loading === "create"}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading === "create" ? "Creating..." : "Create Test Agent"}
                </Button>
              </TabsContent>

              <TabsContent value="db">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {dbStatus?.success ? "✅" : dbStatus ? "❌" : "⏳"}
                      Database Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!dbStatus ? (
                      <div className="text-center p-4">Loading database status...</div>
                    ) : (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                        {JSON.stringify(dbStatus, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agents">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {agentsList?.success ? "✅" : agentsList ? "❌" : "⏳"}
                      Agents List
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!agentsList ? (
                      <div className="text-center p-4">
                        <Button onClick={fetchAgents} variant="outline">
                          Load Agents
                        </Button>
                      </div>
                    ) : (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                        {JSON.stringify(agentsList, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="result">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {createResult?.ok ? "✅" : createResult ? "❌" : "⏳"}
                      Create Agent Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!createResult ? (
                      <div className="text-center p-4">
                        No creation attempt yet. Use the form to create a test agent.
                      </div>
                    ) : (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                        {JSON.stringify(createResult, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
