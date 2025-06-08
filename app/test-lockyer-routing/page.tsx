"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestLockyerRouting() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const checkRouting = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-lockyer-routing")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Error checking routing:", error)
    } finally {
      setLoading(false)
    }
  }

  const testInquirySubmission = async () => {
    setLoading(true)
    try {
      // Simulate an inquiry from lockyersheds page
      const testData = {
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "0400000000",
        siteAddress: "123 Test Street, Test City QLD 4000",
        roofType: "Gable",
        roofCladding: "Corrugated",
        roofPitch: 15,
        length: 6000,
        width: 4000,
        height: 2400,
        roofColor: "SURFMIST / BASALT",
        postBeamColor: "MONUMENT",
        additionalDetails: "Test inquiry from Lockyer Sheds routing test",
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: `${window.location.origin}/lockyersheds`,
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error("Error testing inquiry:", error)
      setTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Lockyer Sheds Routing Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkRouting} disabled={loading}>
                {loading ? "Checking..." : "Check Current Routing"}
              </Button>
              <Button onClick={testInquirySubmission} disabled={loading} variant="outline">
                {loading ? "Testing..." : "Test Inquiry Submission"}
              </Button>
            </div>

            {debugInfo && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">🎯 Current Routing Status</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Has Lockyer Agent:</strong> {debugInfo.routing?.hasLockyerAgent ? "✅ Yes" : "❌ No"}
                    </p>
                    <p>
                      <strong>Active Lockyer Agent:</strong>{" "}
                      {debugInfo.routing?.activeLockyerAgent ? "✅ Yes" : "❌ No"}
                    </p>
                    <p>
                      <strong>Default Sales Emails:</strong>{" "}
                      {debugInfo.routing?.defaultSalesEmails?.join(", ") || "None"}
                    </p>
                  </div>
                </div>

                {debugInfo.lockyerAgent && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">🏢 Lockyer Sheds Agent Found</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Company:</strong> {debugInfo.lockyerAgent.company_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {debugInfo.lockyerAgent.email}
                      </p>
                      <p>
                        <strong>URL Slug:</strong> {debugInfo.lockyerAgent.url_slug}
                      </p>
                      <p>
                        <strong>Status:</strong> {debugInfo.lockyerAgent.status}
                      </p>
                      <p>
                        <strong>Created:</strong> {new Date(debugInfo.lockyerAgent.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">📧 Environment Variables</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>DATABASE_URL:</strong> {debugInfo.environment?.DATABASE_URL ? "✅ Set" : "❌ Missing"}
                    </p>
                    <p>
                      <strong>RESEND_API_KEY:</strong> {debugInfo.environment?.RESEND_API_KEY ? "✅ Set" : "❌ Missing"}
                    </p>
                    <p>
                      <strong>SALES_EMAIL_1:</strong> {debugInfo.environment?.SALES_EMAIL_1}
                    </p>
                    <p>
                      <strong>SALES_EMAIL_2:</strong> {debugInfo.environment?.SALES_EMAIL_2}
                    </p>
                    <p>
                      <strong>SALES_EMAIL_3:</strong> {debugInfo.environment?.SALES_EMAIL_3}
                    </p>
                  </div>
                </div>

                {debugInfo.allAgents && debugInfo.allAgents.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">👥 All Agents ({debugInfo.allAgents.length})</h3>
                    <div className="text-sm space-y-2">
                      {debugInfo.allAgents.map((agent: any) => (
                        <div key={agent.id} className="border-l-2 border-yellow-300 pl-2">
                          <p>
                            <strong>{agent.company_name}</strong> ({agent.status})
                          </p>
                          <p>Email: {agent.email}</p>
                          <p>Slug: /{agent.url_slug}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {debugInfo.recentLockyerInquiries && debugInfo.recentLockyerInquiries.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      📝 Recent Lockyer Inquiries ({debugInfo.recentLockyerInquiries.length})
                    </h3>
                    <div className="text-sm space-y-2">
                      {debugInfo.recentLockyerInquiries.map((inquiry: any) => (
                        <div key={inquiry.id} className="border-l-2 border-purple-300 pl-2">
                          <p>
                            <strong>#{inquiry.id}</strong> - {inquiry.customer_name}
                          </p>
                          <p>Email: {inquiry.customer_email}</p>
                          <p>
                            Agent: {inquiry.agent_email || "None"} ({inquiry.agent_company || "N/A"})
                          </p>
                          <p>Source: {inquiry.source_url || "Unknown"}</p>
                          <p>Date: {new Date(inquiry.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {testResult && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-2">🧪 Test Inquiry Result</h3>
                <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔗 Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a href="/lockyersheds" className="text-blue-600 hover:underline">
                Visit Lockyer Sheds Page
              </a>
              <a href="/admin" className="text-blue-600 hover:underline">
                Admin Panel
              </a>
              <a href="/api/debug-lockyer-routing" className="text-blue-600 hover:underline">
                Raw Debug Data
              </a>
              <a href="/view-data" className="text-blue-600 hover:underline">
                View All Data
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
