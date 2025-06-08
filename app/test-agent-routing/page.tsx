"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAgentRouting() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAgentSystem = async (slug = "lockyersheds") => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/test-agent-system?slug=${slug}`)
      const data = await response.json()
      setTestResults(data)
      console.log("Test results:", data)
    } catch (error) {
      console.error("Test failed:", error)
      setTestResults({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const testInquirySubmission = async () => {
    setIsLoading(true)
    try {
      // Simulate an inquiry submission
      const testData = {
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "1234567890",
        siteAddress: "123 Test Street, Test City",
        roofType: "Gable",
        roofCladding: "Corrugated",
        roofPitch: 15,
        length: 3000,
        width: 3000,
        height: 2400,
        roofColor: "SURFMIST / BASALT",
        postBeamColor: "MONUMENT",
        hasOverhang: false,
        overhangSides: [],
        overhangSize: 0,
        agentData: {
          id: 1,
          company_name: "Lockyer Sheds",
          email: "test@lockyersheds.com",
          url_slug: "lockyersheds",
        },
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://aussie-patio-designer.vercel.app/lockyersheds",
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      setTestResults({ ...result, testType: "inquiry_submission" })
      console.log("Inquiry test results:", result)
    } catch (error) {
      console.error("Inquiry test failed:", error)
      setTestResults({ success: false, error: error.message, testType: "inquiry_submission" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Agent Routing Test</h1>

      <div className="grid gap-4 mb-6">
        <Button onClick={() => testAgentSystem("lockyersheds")} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Agent System (lockyersheds)"}
        </Button>

        <Button onClick={() => testAgentSystem("test-agent")} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Non-existent Agent"}
        </Button>

        <Button onClick={testInquirySubmission} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Inquiry Submission"}
        </Button>
      </div>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(testResults, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
