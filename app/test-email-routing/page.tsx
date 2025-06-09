"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function TestEmailRouting() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [agentSlug, setAgentSlug] = useState("")
  const [sourceUrl, setSourceUrl] = useState("https://aussie-patio-designer.vercel.app/lockyer-sheds")

  const testRouting = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-email-routing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentSlug: agentSlug || undefined,
          sourceUrl: sourceUrl || undefined,
        }),
      })

      const result = await response.json()
      setTestResults(result)
    } catch (error) {
      setTestResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Email Routing Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Email Routing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="agentSlug">Agent Slug (optional)</Label>
            <Input
              id="agentSlug"
              value={agentSlug}
              onChange={(e) => setAgentSlug(e.target.value)}
              placeholder="e.g., lockyer-sheds"
            />
          </div>

          <div>
            <Label htmlFor="sourceUrl">Source URL (optional)</Label>
            <Input
              id="sourceUrl"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="e.g., https://aussie-patio-designer.vercel.app/lockyer-sheds"
            />
          </div>

          <Button onClick={testRouting} disabled={loading}>
            {loading ? "Testing..." : "Test Email Routing"}
          </Button>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Routing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(testResults, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>1. Agent Email:</strong> If an agent exists with their own email, inquiries go to them
            </p>
            <p>
              <strong>2. Fallback Email:</strong> Otherwise, all inquiries go to SALES_EMAIL_1 (gaziogutcu.go@gmail.com)
            </p>
            <p>
              <strong>3. Agent Detection:</strong> Agents are detected by URL slug (e.g., /lockyer-sheds) or agent data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
