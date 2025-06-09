"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function TrackLockyer() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [trackingData, setTrackingData] = useState<any>(null)
  const [customerEmail, setCustomerEmail] = useState("")
  const [loading, setLoading] = useState(false)

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

  const trackInquiry = async () => {
    if (!customerEmail) return

    setLoading(true)
    try {
      const response = await fetch("/api/track-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail, customerName: "Test" }),
      })
      const data = await response.json()
      setTrackingData(data)
    } catch (error) {
      console.error("Error tracking inquiry:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkRouting()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Lockyer Sheds Email Routing Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Routing Status */}
            {debugInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🎯 Current Routing Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={debugInfo.routing?.hasLockyerAgent ? "default" : "destructive"}>
                        {debugInfo.routing?.hasLockyerAgent ? "✅ Agent Found" : "❌ No Agent"}
                      </Badge>
                      <span className="text-sm">Lockyer Sheds Agent</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={debugInfo.routing?.activeLockyerAgent ? "default" : "secondary"}>
                        {debugInfo.routing?.activeLockyerAgent ? "✅ Active" : "⚠️ Inactive"}
                      </Badge>
                      <span className="text-sm">Agent Status</span>
                    </div>
                  </div>

                  {debugInfo.lockyerAgent && (
                    <div className="bg-green-50 p-4 rounded-lg border">
                      <h4 className="font-medium text-green-900 mb-2">🏢 Lockyer Sheds Agent</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Company:</strong> {debugInfo.lockyerAgent.company_name}
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          <span className="font-mono bg-green-100 px-2 py-1 rounded">
                            {debugInfo.lockyerAgent.email}
                          </span>
                        </p>
                        <p>
                          <strong>URL:</strong> /{debugInfo.lockyerAgent.url_slug}
                        </p>
                        <p>
                          <strong>Status:</strong> {debugInfo.lockyerAgent.status}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📧 Email Fallback</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-blue-900 mb-2">Default Sales Emails</h4>
                    <div className="text-sm space-y-1">
                      {debugInfo.routing?.defaultSalesEmails?.map((email: string, index: number) => (
                        <p key={index}>
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded">{email}</span>
                        </p>
                      )) || <p className="text-red-600">No fallback emails configured!</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Track Specific Inquiry */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Track Specific Inquiry</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Customer Email</label>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <Button onClick={trackInquiry} disabled={loading || !customerEmail}>
                  {loading ? "Tracking..." : "Track Inquiry"}
                </Button>
              </div>
            </div>

            {/* Tracking Results */}
            {trackingData && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">📊 Tracking Results</h3>
                {trackingData.found ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">📝 Inquiry Details</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <strong>ID:</strong> #{trackingData.inquiry.id}
                          </p>
                          <p>
                            <strong>Customer:</strong> {trackingData.inquiry.customer_name}
                          </p>
                          <p>
                            <strong>Email:</strong> {trackingData.inquiry.customer_email}
                          </p>
                          <p>
                            <strong>Date:</strong> {new Date(trackingData.inquiry.created_at).toLocaleString()}
                          </p>
                          <p>
                            <strong>Source URL:</strong> {trackingData.inquiry.source_url || "Not recorded"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">📧 Email Routing</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={trackingData.routing.match ? "default" : "destructive"}>
                              {trackingData.routing.match ? "✅ Correct" : "❌ Mismatch"}
                            </Badge>
                            <span>Routing Status</span>
                          </div>

                          <div className="space-y-1">
                            <p>
                              <strong>Expected Email:</strong>
                            </p>
                            <p className="font-mono bg-green-100 px-2 py-1 rounded text-xs">
                              {trackingData.routing.expectedEmail}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p>
                              <strong>Actual Email:</strong>
                            </p>
                            <p
                              className={`font-mono px-2 py-1 rounded text-xs ${
                                trackingData.routing.match ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              {trackingData.routing.actualEmail}
                            </p>
                          </div>

                          <p>
                            <strong>Company:</strong> {trackingData.routing.company}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!trackingData.routing.match && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">⚠️ Routing Issue Detected</h4>
                        <p className="text-sm text-red-700">
                          The inquiry was not routed to the expected Lockyer Sheds email address. This suggests there
                          may be an issue with the agent detection or routing logic.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-800">No inquiry found for this email address.</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" asChild>
                  <a href="/lockyersheds">Visit Lockyer Page</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/admin">Admin Panel</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/view-data">View All Data</a>
                </Button>
                <Button variant="outline" onClick={checkRouting}>
                  Refresh Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
