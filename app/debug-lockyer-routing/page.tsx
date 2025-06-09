"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugLockyerRouting() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testRouting = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-lockyer-routing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testUrl: "https://aussie-patio-designer.vercel.app/lockyer-sheds",
          agentSlug: "lockyer-sheds",
        }),
      })

      const result = await response.json()
      setDebugInfo(result)
    } catch (error) {
      console.error("Error testing routing:", error)
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testAgentLookup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-agent-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: "lockyer-sheds",
        }),
      })

      const result = await response.json()
      setDebugInfo(result)
    } catch (error) {
      console.error("Error testing agent lookup:", error)
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Debug Lockyer Sheds Email Routing</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Routing Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testRouting} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test Email Routing for Lockyer Sheds"}
            </Button>

            <Button onClick={testAgentLookup} disabled={loading} variant="outline" className="w-full">
              {loading ? "Testing..." : "Test Agent Database Lookup"}
            </Button>
          </CardContent>
        </Card>

        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>URL:</strong> https://aussie-patio-designer.vercel.app/lockyer-sheds
              </p>
              <p>
                <strong>Expected Agent:</strong> Lockyer Sheds
              </p>
              <p>
                <strong>Expected Email:</strong> Should route to Lockyer Sheds email address
              </p>
              <p>
                <strong>Current Issue:</strong> Email shows as sent but doesn't reach agent
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
