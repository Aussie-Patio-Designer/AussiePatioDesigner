"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAgentCreation() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-create-agent")
      const data = await response.json()
      setTestResult({
        status: response.status,
        ok: response.ok,
        data,
      })
    } catch (error) {
      setTestResult({
        status: 0,
        ok: false,
        data: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Agent Creation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={runTest} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Running Test..." : "🚀 Run Complete Agent Test"}
              </Button>

              {testResult && (
                <Card className={testResult.ok ? "border-green-500" : "border-red-500"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {testResult.ok ? "✅" : "❌"}
                      Test Result (Status: {testResult.status})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
