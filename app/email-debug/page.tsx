"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, AlertTriangle, Copy, ExternalLink } from "lucide-react"

export default function EmailDebugPage() {
  const [testEmail, setTestEmail] = useState("")
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [checkingConfig, setCheckingConfig] = useState(false)

  const testEmailSystem = async () => {
    if (!testEmail) {
      alert("Please enter an email address to test")
      return
    }

    setTesting(true)
    setResult(null)

    try {
      // Test with a sample inquiry
      const testData = {
        customerName: "Test Customer",
        customerEmail: testEmail,
        siteAddress: "123 Test Street, Test City QLD 4000",
        roofType: "Gable",
        roofCladding: "Insulated Panel",
        roofPitch: 15,
        length: 3000,
        width: 3000,
        height: 2400,
        hasOverhang: false,
        overhangSides: [],
        overhangSize: 0,
        roofColor: "SURFMIST / BASALT",
        postBeamColor: "MONUMENT",
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  const checkEmailConfig = async () => {
    setCheckingConfig(true)
    try {
      const response = await fetch("/api/test/email")
      const data = await response.json()
      setConfigStatus(data)
    } catch (error) {
      setConfigStatus({ success: false, message: "Failed to check email configuration" })
    } finally {
      setCheckingConfig(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Setup Guide & Debug</h1>
          <p className="text-gray-600">Complete setup guide and testing for Resend email service</p>
        </div>

        {/* Setup Guide */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Resend Setup Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 1: Create Resend Account</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
                    <span>Visit</span>
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>resend.com</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">2</span>
                    <span>Click "Get Started" and sign up with your email</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">3</span>
                    <span>Choose the free plan (100 emails/day)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">4</span>
                    <span>Verify your email address</span>
                  </li>
                </ol>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 2: Get API Key</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">1</span>
                    <span>Login to Resend dashboard</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">2</span>
                    <span>Click "API Keys" in the sidebar</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">3</span>
                    <span>Click "Create API Key"</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">4</span>
                    <span>Name it "Gazebo App" and select "Full access"</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">5</span>
                    <span className="font-semibold text-red-600">
                      IMPORTANT: Copy the API key immediately - you won't see it again!
                    </span>
                  </li>
                </ol>
                <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Your API key will look like this:</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-sm">re_xxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard("RESEND_API_KEY")}
                      className="h-8"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 3: Add to Vercel</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">1</span>
                    <span>Go to</span>
                    <a
                      href="https://vercel.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>vercel.com/dashboard</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">2</span>
                    <span>Click on your gazebo project</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">3</span>
                    <span>Go to Settings → Environment Variables</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">4</span>
                    <span>Add new variable:</span>
                  </li>
                </ol>
                <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium">Name:</label>
                      <div className="flex items-center space-x-2">
                        <code className="bg-white px-2 py-1 rounded">RESEND_API_KEY</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard("RESEND_API_KEY")}
                          className="h-8"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="font-medium">Value:</label>
                      <p className="text-gray-600">Paste your API key here</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Select "Production" environment and click Save</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 4: Redeploy</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">1</span>
                    <span>Go to the "Deployments" tab in your Vercel project</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">2</span>
                    <span>Click the three dots (...) on your latest deployment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">3</span>
                    <span>Select "Redeploy" to rebuild with the new environment variable</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">4</span>
                    <span>Wait for deployment to complete (1-2 minutes)</span>
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration Check */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Step 5: Test Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={checkEmailConfig} disabled={checkingConfig} variant="outline">
                {checkingConfig ? "Checking..." : "Check Email Configuration"}
              </Button>

              {configStatus && (
                <div
                  className={`p-4 rounded-lg border ${configStatus.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {configStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-semibold">{configStatus.message}</span>
                  </div>
                  {configStatus.details && <p className="text-sm text-gray-600">{configStatus.details}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Step 6: Send Test Email</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email to receive a test"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <Button onClick={testEmailSystem} disabled={testing || !testEmail}>
                {testing ? "Sending Test Email..." : "Send Test Email"}
              </Button>

              {result && (
                <div
                  className={`p-4 rounded-lg border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-semibold">{result.success ? "Test Completed" : "Test Failed"}</span>
                    {result.emailSent !== undefined && (
                      <Badge
                        className={result.emailSent ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {result.emailSent ? "Email Sent ✅" : "Email Not Sent ❌"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.emailError && <p className="text-sm text-red-600">Email Error: {result.emailError}</p>}
                  {result.emailSent && (
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Check your inbox (and spam folder) for the test email!
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Troubleshooting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Common Issues:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>
                    • <strong>API key not working:</strong> Make sure you copied the entire key correctly
                  </li>
                  <li>
                    • <strong>Still no emails:</strong> Check your spam/junk folder
                  </li>
                  <li>
                    • <strong>Configuration shows "not configured":</strong> Redeploy after adding the API key
                  </li>
                  <li>
                    • <strong>Rate limit errors:</strong> Free plan has 100 emails/day limit
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
                <p className="text-blue-700 text-sm">
                  If you're still having issues, check the Vercel deployment logs or contact support. The inquiry system
                  works without email - customers just won't get automatic confirmations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
