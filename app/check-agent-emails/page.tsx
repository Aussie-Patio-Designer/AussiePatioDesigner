"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Agent {
  id: number
  company_name: string
  email: string
  url_slug: string
  status: string
}

export default function CheckAgentEmails() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailChecks, setEmailChecks] = useState<Record<string, { valid: boolean; reason?: string }>>({})
  const [checkingEmails, setCheckingEmails] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/agents")
      const data = await response.json()

      if (response.ok && data.success) {
        setAgents(data.agents || [])
      } else {
        setError(data.error || "Failed to fetch agents")
      }
    } catch (error) {
      setError("Error fetching agents: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const checkEmails = async () => {
    setCheckingEmails(true)
    const checks: Record<string, { valid: boolean; reason?: string }> = {}

    try {
      for (const agent of agents) {
        const response = await fetch("/api/check-email-validity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: agent.email }),
        })

        const result = await response.json()
        checks[agent.email] = {
          valid: result.valid,
          reason: result.reason,
        }
      }

      setEmailChecks(checks)
    } catch (error) {
      setError("Error checking emails: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setCheckingEmails(false)
    }
  }

  const testSendEmail = async (email: string) => {
    try {
      const response = await fetch("/api/test-email-sending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          subject: "Test Email from Aussie Patio Designer",
          message: "This is a test email to verify delivery to your address.",
        }),
      })

      const result = await response.json()

      // Update the email check with the result
      setEmailChecks((prev) => ({
        ...prev,
        [email]: {
          ...prev[email],
          testSent: true,
          testSuccess: result.success,
          testError: result.error,
          testResult: result,
        },
      }))

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Check Agent Email Addresses</h1>

      <div className="mb-6 flex gap-4">
        <Button onClick={fetchAgents} disabled={loading}>
          {loading ? "Loading..." : "Refresh Agents"}
        </Button>
        <Button onClick={checkEmails} disabled={loading || checkingEmails || agents.length === 0} variant="outline">
          {checkingEmails ? "Checking..." : "Validate All Emails"}
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading agents...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <p>No agents found. Add agents in the admin dashboard.</p>
              </CardContent>
            </Card>
          ) : (
            agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{agent.company_name}</span>
                    <Badge
                      className={
                        agent.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Email Address</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{agent.email}</span>
                        {emailChecks[agent.email] && (
                          <Badge
                            className={
                              emailChecks[agent.email].valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {emailChecks[agent.email].valid ? "Valid" : "Invalid"}
                          </Badge>
                        )}
                      </div>
                      {emailChecks[agent.email] && !emailChecks[agent.email].valid && (
                        <div className="text-sm text-red-600 mt-1">{emailChecks[agent.email].reason}</div>
                      )}
                      {emailChecks[agent.email]?.testSent && (
                        <div
                          className={`text-sm mt-1 ${emailChecks[agent.email].testSuccess ? "text-green-600" : "text-red-600"}`}
                        >
                          {emailChecks[agent.email].testSuccess
                            ? "✓ Test email sent successfully"
                            : `✗ Test failed: ${emailChecks[agent.email].testError || "Unknown error"}`}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">URL Slug</div>
                      <div className="font-mono">/{agent.url_slug}</div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testSendEmail(agent.email)}
                        disabled={emailChecks[agent.email]?.testSent}
                      >
                        {emailChecks[agent.email]?.testSent ? "Test Sent" : "Send Test Email"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(`/test-email-sending?email=${encodeURIComponent(agent.email)}`, "_blank")
                        }
                      >
                        Advanced Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
