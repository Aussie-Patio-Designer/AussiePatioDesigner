"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface Stats {
  total: number
  new_inquiries: number
  contacted: number
  quoted: number
  completed: number
  this_week: number
  this_month: number
}

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    fetchData()
  }, [selectedStatus])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch stats
      const statsResponse = await fetch("/api/admin/inquiries?action=stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch inquiries
      const inquiriesResponse = await fetch(`/api/admin/inquiries?status=${selectedStatus}&limit=20`)
      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json()
        setInquiries(inquiriesData.inquiries || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
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
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gazebo Inquiries Dashboard</h1>
          <p className="text-gray-600">Manage and track customer gazebo inquiries</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">New This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.this_week}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.this_month}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inquiries Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Customer Inquiries</CardTitle>
              <Button onClick={fetchData} variant="outline" size="sm">
                Refresh
              </Button>
            </div>

            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="contacted">Contacted</TabsTrigger>
                <TabsTrigger value="quoted">Quoted</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Roof Type</th>
                    <th className="text-left p-2">Dimensions</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">#{inquiry.id.toString().padStart(6, "0")}</td>
                      <td className="p-2 font-medium">{inquiry.customer_name}</td>
                      <td className="p-2 text-blue-600">{inquiry.customer_email}</td>
                      <td className="p-2">{inquiry.roof_type}</td>
                      <td className="p-2">
                        {(inquiry.length / 1000).toFixed(1)}×{(inquiry.width / 1000).toFixed(1)}×
                        {(inquiry.height / 1000).toFixed(1)}m
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                      </td>
                      <td className="p-2 text-gray-600">{formatDate(inquiry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {inquiries.length === 0 && (
                <div className="text-center py-8 text-gray-500">No inquiries found for the selected status.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
