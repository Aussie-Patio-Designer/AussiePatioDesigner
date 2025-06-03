"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error" | "running"
  message: string
  details?: string
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Environment Variables", status: "pending", message: "Not tested" },
    { name: "Database Connection", status: "pending", message: "Not tested" },
    { name: "Database Operations", status: "pending", message: "Not tested" },
    { name: "Form Validation", status: "pending", message: "Not tested" },
    { name: "Email System", status: "pending", message: "Not tested" },
    { name: "Blob Storage", status: "pending", message: "Not tested" },
    { name: "Admin Authentication", status: "pending", message: "Not tested" },
  ])

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, ...updates } : test)))
  }

  const runTest = async (
    testName: string,
    testFunction: () => Promise<{ success: boolean; message: string; details?: string }>,
  ) => {
    const index = tests.findIndex((t) => t.name === testName)
    updateTest(index, { status: "running", message: "Testing..." })

    try {
      const result = await testFunction()
      updateTest(index, {
        status: result.success ? "success" : "error",
        message: result.message,
        details: result.details,
      })
    } catch (error) {
      updateTest(index, {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const testEnvironmentVariables = async () => {
    const response = await fetch("/api/test/env")
    const data = await response.json()
    return {
      success: data.success,
      message: data.message,
      details: data.details,
    }
  }

  const testDatabaseConnection = async () => {
    const response = await fetch("/api/test-db")
    const data = await response.json()
    return {
      success: data.success,
      message: data.message,
      details: `Total inquiries: ${data.stats?.total || 0}`,
    }
  }

  const testDatabaseOperations = async () => {
    const response = await fetch("/api/test-db", { method: "POST" })
    const data = await response.json()
    return {
      success: data.success,
      message: data.message,
      details: data.inquiryId ? `Created inquiry ID: ${data.inquiryId}` : undefined,
    }
  }

  const testFormValidation = async () => {
    // Test with invalid data
    const invalidData = {
      customerName: "A", // Too short
      customerEmail: "invalid-email", // Invalid format
      siteAddress: "Short", // Too short
      roofType: "Gable",
      roofCladding: "Insulated Panel",
      roofPitch: 15,
      length: 500, // Too small
      width: 3000,
      height: 2400,
      hasOverhang: false,
      overhangSides: [],
      overhangSize: 300,
      roofColor: "", // Empty
      postBeamColor: "MONUMENT",
    }

    const response = await fetch("/api/test/validation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    })

    const data = await response.json()
    return {
      success: !data.valid, // Should fail validation
      message: data.valid ? "Validation incorrectly passed" : "Validation correctly failed",
      details: `Errors found: ${data.errors?.length || 0}`,
    }
  }

  const testEmailSystem = async () => {
    const response = await fetch("/api/test/email")
    const data = await response.json()
    return {
      success: data.success,
      message: data.message,
      details: data.details,
    }
  }

  const testBlobStorage = async () => {
    const response = await fetch("/api/test/blob")
    const data = await response.json()
    return {
      success: data.success,
      message: data.message,
      details: data.details,
    }
  }

  const testAdminAuth = async () => {
    // Test without credentials
    const response1 = await fetch("/admin")

    if (response1.status === 401) {
      return {
        success: true,
        message: "Admin authentication is working",
        details: "Correctly requires authentication",
      }
    } else {
      return {
        success: false,
        message: "Admin authentication is not working",
        details: `Expected 401, got ${response1.status}`,
      }
    }
  }

  const runAllTests = async () => {
    await runTest("Environment Variables", testEnvironmentVariables)
    await runTest("Database Connection", testDatabaseConnection)
    await runTest("Database Operations", testDatabaseOperations)
    await runTest("Form Validation", testFormValidation)
    await runTest("Email System", testEmailSystem)
    await runTest("Blob Storage", testBlobStorage)
    await runTest("Admin Authentication", testAdminAuth)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Test Suite</h1>
          <p className="text-gray-600">Test all the immediate fixes and critical functionality</p>
        </div>

        <div className="mb-6">
          <Button onClick={runAllTests} className="mr-4">
            Run All Tests
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset Tests
          </Button>
        </div>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={test.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(test.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        switch (test.name) {
                          case "Environment Variables":
                            runTest(test.name, testEnvironmentVariables)
                            break
                          case "Database Connection":
                            runTest(test.name, testDatabaseConnection)
                            break
                          case "Database Operations":
                            runTest(test.name, testDatabaseOperations)
                            break
                          case "Form Validation":
                            runTest(test.name, testFormValidation)
                            break
                          case "Email System":
                            runTest(test.name, testEmailSystem)
                            break
                          case "Blob Storage":
                            runTest(test.name, testBlobStorage)
                            break
                          case "Admin Authentication":
                            runTest(test.name, testAdminAuth)
                            break
                        }
                      }}
                      disabled={test.status === "running"}
                    >
                      {test.status === "running" ? "Testing..." : "Test"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">{test.message}</p>
                {test.details && <p className="text-sm text-gray-500">{test.details}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Test Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Environment Variables:</strong> Checks if all required environment variables are configured
            </li>
            <li>
              • <strong>Database Connection:</strong> Tests if the database connection is working
            </li>
            <li>
              • <strong>Database Operations:</strong> Tests creating a new inquiry in the database
            </li>
            <li>
              • <strong>Form Validation:</strong> Tests server-side validation with invalid data
            </li>
            <li>
              • <strong>Email System:</strong> Tests if the email system is configured and working
            </li>
            <li>
              • <strong>Blob Storage:</strong> Tests if blob storage is configured for screenshots
            </li>
            <li>
              • <strong>Admin Authentication:</strong> Tests if admin routes require authentication
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
