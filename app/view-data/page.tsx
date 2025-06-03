"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Mail, MapPin, Ruler } from "lucide-react"

interface Inquiry {
  id: number
  customer_name: string
  customer_email: string
  site_address: string
  roof_type: string
  roof_cladding: string
  roof_pitch: number
  length: number
  width: number
  height: number
  has_overhang: boolean
  overhang_sides: string[]
  overhang_size: number
  roof_color: string
  post_beam_color: string
  screenshot_url?: string
  created_at: string
  status: string
}

export default function ViewDataPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/inquiries?limit=50")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setInquiries(data.inquiries || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "quoted":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading inquiry data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gazebo Inquiries Data</h1>
          <p className="text-gray-600">View all submitted gazebo inquiries</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total inquiries: <span className="font-semibold">{inquiries.length}</span>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Error: {error}</p>
              <p className="text-red-600 text-sm mt-2">
                This might mean the database isn't set up yet or there's a connection issue.
              </p>
            </CardContent>
          </Card>
        )}

        {inquiries.length === 0 && !error ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No inquiries found. Try submitting a test inquiry first.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>#{inquiry.id.toString().padStart(6, "0")}</span>
                        <Badge className={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600">{formatDate(inquiry.created_at)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Customer Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Name:</span> {inquiry.customer_name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {inquiry.customer_email}
                        </p>
                      </div>
                    </div>

                    {/* Site Address */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Site Address
                      </h4>
                      <p className="text-sm whitespace-pre-line">{inquiry.site_address}</p>
                    </div>

                    {/* Specifications */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Ruler className="h-4 w-4 mr-2" />
                        Specifications
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Type:</span> {inquiry.roof_type}
                        </p>
                        <p>
                          <span className="font-medium">Material:</span> {inquiry.roof_cladding}
                        </p>
                        <p>
                          <span className="font-medium">Pitch:</span> {inquiry.roof_pitch}°
                        </p>
                        <p>
                          <span className="font-medium">Size:</span> {inquiry.length}×{inquiry.width}×{inquiry.height}mm
                        </p>
                        <p>
                          <span className="font-medium">Roof:</span> {inquiry.roof_color}
                        </p>
                        <p>
                          <span className="font-medium">Frame:</span> {inquiry.post_beam_color}
                        </p>
                        {inquiry.has_overhang && (
                          <p>
                            <span className="font-medium">Overhang:</span> {inquiry.overhang_sides.join(", ")} (
                            {inquiry.overhang_size}mm)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {inquiry.screenshot_url && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">3D Preview Screenshot</h4>
                      <img
                        src={inquiry.screenshot_url || "/placeholder.svg"}
                        alt="Gazebo 3D Preview"
                        className="max-w-sm rounded-lg border"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
