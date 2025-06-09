"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugLockyerEmail() {
  const [debugData, setDebugData] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadDebugData = async () => {
    try {
      const response = await fetch("/api/debug-email-routing")
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error("Error loading debug data:", error)
    }
  }

  const sendTestEmail = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-lockyer-email", { method: "POST" })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error("Error sending test email:", error)
      setTestResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDebugData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Lockyer Sheds Email Debugging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Test */}
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">🧪 Quick Test</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test email directly to gazi@lockyersheds.com.au to verify the email system is working.
              </p>
              <Button onClick={sendTestEmail} disabled={loading}>
                {loading ? "Sending Test Email..." : "Send Test Email to Lockyer Sheds"}
              </Button>
            </div>

            {/* Test Results */}
            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription>
                  {testResult.success ? (
                    <div>
                      <strong>✅ Test email sent successfully!</strong>
                      <p className="mt-2">Check gazi@lockyersheds.com.au for the test email.</p>
                      {testResult.emailResult && (
                        <p className="text-xs mt-2 font-mono">Email ID: {testResult.emailResult.id}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <strong>❌ Test email failed:</strong>
                      <p className="mt-2">{testResult.error}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {debugData && (
              <>
                {/* Diagnostics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Badge variant={debugData.diagnostics.agentExists ? "default" : "destructive"}>
                      {debugData.diagnostics.agentExists ? "✅" : "❌"}
                    </Badge>
                    <p className="text-sm mt-1">Agent Exists</p>
                  </div>
                  <div className="text-center">
                    <Badge variant={debugData.diagnostics.agentActive ? "default" : "destructive"}>
                      {debugData.diagnostics.agentActive ? "✅" : "❌"}
                    </Badge>
                    <p className="text-sm mt-1">Agent Active</p>
                  </div>
                  <div className="text-center">
                    <Badge variant={debugData.diagnostics.correctEmail ? "default" : "destructive"}>
                      {debugData.diagnostics.correctEmail ? "✅" : "❌"}
                    </Badge>
                    <p className="text-sm mt-1">Correct Email</p>
                  </div>
                  <div className="text-center">
                    <Badge variant={debugData.diagnostics.hasResendKey ? "default" : "destructive"}>
                      {debugData.diagnostics.hasResendKey ? "✅" : "❌"}
                    </Badge>
                    <p className="text-sm mt-1">Resend Configured</p>
                  </div>
                </div>

                {/* Lockyer Agent Details */}
                {debugData.lockyerAgent ? (
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3">🏢 Lockyer Sheds Agent</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p>
                          <strong>Company:</strong> {debugData.lockyerAgent.company_name}
                        </p>
                        <p>
                          <strong>Contact:</strong> {debugData.lockyerAgent.contact_name}
                        </p>
                        <p>
                          <strong>Email:</strong>
                          <span
                            className={`ml-2 font-mono px-2 py-1 rounded text-sm ${
                              debugData.lockyerAgent.email === "gazi@lockyersheds.com.au"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {debugData.lockyerAgent.email}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>URL Slug:</strong> {debugData.lockyerAgent.url_slug}
                        </p>
                        <p>
                          <strong>Status:</strong>
                          <Badge
                            variant={debugData.lockyerAgent.status === "active" ? "default" : "destructive"}
                            className="ml-2"
                          >
                            {debugData.lockyerAgent.status}
                          </Badge>
                        </p>
                        <p>
                          <strong>Created:</strong> {new Date(debugData.lockyerAgent.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription>
                      <strong>❌ No Lockyer Sheds agent found!</strong>
                      <p className="mt-2">This is the main issue. The agent needs to be created or reactivated.</p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email Configuration */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">📧 Email Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Resend API</h4>
                      <p className="text-sm">
                        <strong>Status:</strong>
                        <Badge variant={debugData.envCheck.hasResendKey ? "default" : "destructive"} className="ml-2">
                          {debugData.envCheck.hasResendKey ? "Configured" : "Missing"}
                        </Badge>
                      </p>
                      {debugData.envCheck.hasResendKey && (
                        <p className="text-sm">
                          <strong>Key Length:</strong> {debugData.envCheck.resendKeyLength} chars
                        </p>
                      )}
                      {debugData.resendTest && (
                        <p className="text-sm">
                          <strong>Test:</strong> {debugData.resendTest.status}
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Fallback Emails</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Sales 1:</strong> {debugData.envCheck.salesEmail1}
                        </p>
                        <p>
                          <strong>Sales 2:</strong> {debugData.envCheck.salesEmail2}
                        </p>
                        <p>
                          <strong>Sales 3:</strong> {debugData.envCheck.salesEmail3}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Inquiries */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">📋 Recent Inquiries (Last 24h)</h3>
                  {debugData.recentInquiries.length > 0 ? (
                    <div className="space-y-2">
                      {debugData.recentInquiries.map((inquiry: any) => (
                        <div key={inquiry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">
                              #{inquiry.id} - {inquiry.customer_name}
                            </p>
                            <p className="text-sm text-gray-600">{inquiry.customer_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              <strong>Routed to:</strong> {inquiry.agent_email || "Default sales team"}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(inquiry.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent inquiries found</p>
                  )}
                </div>

                {/* Expected vs Actual Routing */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">🎯 Expected Routing</h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Lockyer Inquiries should go to:</strong>
                      <span className="ml-2 font-mono bg-green-100 px-2 py-1 rounded text-sm">
                        {debugData.expectedRouting.lockyerEmail}
                      </span>
                    </p>
                    <p>
                      <strong>Other inquiries go to:</strong>
                      {debugData.expectedRouting.fallbackEmails.map((email: string, index: number) => (
                        <span key={index} className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                          {email}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold mb-3">🔧 Action Items</h3>
                  <div className="space-y-2 text-sm">
                    {!debugData.diagnostics.agentExists && <p>❌ Create Lockyer Sheds agent in admin panel</p>}
                    {!debugData.diagnostics.agentActive && <p>❌ Activate Lockyer Sheds agent</p>}
                    {!debugData.diagnostics.correctEmail && <p>❌ Update agent email to gazi@lockyersheds.com.au</p>}
                    {!debugData.diagnostics.hasResendKey && <p>❌ Configure RESEND_API_KEY environment variable</p>}
                    {debugData.diagnostics.agentExists &&
                      debugData.diagnostics.agentActive &&
                      debugData.diagnostics.correctEmail &&
                      debugData.diagnostics.hasResendKey && <p>✅ All checks passed! Test the email routing.</p>}
                  </div>
                </div>
              </>
            )}

            {/* Quick Actions */}
            <div className="flex gap-4 flex-wrap">
              <Button variant="outline" onClick={loadDebugData}>
                Refresh Data
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin">Admin Panel</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/lockyersheds">Test Lockyer Page</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/view-data">View All Data</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
