"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestEmailSending() {
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("Test Email from Aussie Patio Designer")
  const [message, setMessage] = useState("This is a test email to verify email delivery.")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const sendTestEmail = async () => {
    if (!email) {
      setResult({ error: "Please enter an email address" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email-sending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          subject,
          message,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Test Email Sending</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button onClick={sendTestEmail} disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{result.success ? "Email Sent Successfully" : "Email Failed"}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium">Troubleshooting Tips:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Make sure the Resend API key is properly configured</li>
          <li>Check that the recipient email is valid and not a test domain</li>
          <li>Verify the email isn't being caught by spam filters</li>
          <li>Check server logs for detailed error messages</li>
        </ul>
      </div>
    </div>
  )
}
