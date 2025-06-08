"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugAgents() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAgentCreation = async () => {
    setLoading(true)
    setResult(null)

    const testAgent = {
      company_name: "Debug Test Company",
      contact_name: "Debug User",
      email: `debug-${Date.now()}@example.com`,
      phone: "+61 400 000 000",
      website: "https://debugtest.com",
      url_slug: `debug-test-${Date.now()}`,
      subscription_type: "basic",
    }

    try {
      console.log("Sending test agent data:", testAgent)

      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testAgent),
      })

      const data = await response.json()
      console.log("Response:", data)

      setResult({
        status: response.status,
        success: response.ok,
        data: data,
        testAgent: testAgent,
      })
    } catch (error) {
      console.error("Error:", error)
      setResult({
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        testAgent: testAgent,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/agents")
      const data = await response.json()
      setResult({
        status: response.status,
        success: response.ok,
        data: data,
        action: "fetch",
      })
    } catch (error) {
      setResult({
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        action: "fetch",
      })
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/verify-db")
      const data = await response.json()
      setResult({
        status: response.status,
        success: response.ok,
        data: data,
        action: "verify-db",
      })
    } catch (error) {
      setResult({
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        action: "verify-db",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔧 Agent Creation Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testDatabaseConnection} disabled={loading} variant="outline">
                {loading ? "Testing..." : "🔍 Test Database"}
              </Button>

              <Button onClick={fetchAgents} disabled={loading} variant="outline">
                {loading ? "Loading..." : "📋 Fetch Agents"}
              </Button>

              <Button onClick={testAgentCreation} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? "Creating..." : "➕ Test Create Agent"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? "✅" : "❌"}
                Debug Results
                <Badge className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  Status: {result.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
