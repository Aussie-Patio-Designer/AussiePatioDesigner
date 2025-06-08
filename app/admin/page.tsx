"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddAgentModal } from "@/components/add-agent-modal"

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

interface Agent {
  id: number
  company_name: string
  contact_name: string
  email: string
  phone?: string
  website?: string
  logo_url?: string
  url_slug: string
  status: string
  subscription_type: string
  subscription_expires_at?: string
  created_at: string
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
  const [agents, setAgents] = useState<Agent[]>([])
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [agentsLoading, setAgentsLoading] = useState(false)

  useEffect(() => {
    fetchData()
    fetchAgents()
  }, [])

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

  const fetchAgents = async () => {
    try {
      setAgentsLoading(true)
      const response = await fetch("/api/admin/agents")
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
    } finally {
      setAgentsLoading(false)
    }
  }

  const handleAddAgent = async (agentData: any) => {
    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchAgents()
        setShowAddAgent(false)
        alert(`Agent added successfully! Customer URL: ${result.agent.customer_url}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error adding agent:", error)
      alert("Failed to add agent. Please try again.")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("URL copied to clipboard!")
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

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case "basic":
        return "bg-blue-100 text-blue-800"
      case "premium":
        return "bg-purple-100 text-purple-800"
      case "enterprise":
        return "bg-orange-100 text-orange-800"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage customer inquiries and agent partnerships</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              👥 Customer Inquiries
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              🏢 Agent Management
            </TabsTrigger>
          </TabsList>

          {/* INQUIRIES SECTION */}
          <TabsContent value="inquiries" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">👥</span>
                <h2 className="text-lg font-semibold text-blue-900">Customer Inquiries Management</h2>
              </div>
              <p className="text-blue-700 text-sm">
                Track and manage all customer gazebo design inquiries from your platform and partner websites.
              </p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">New This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.this_week}</div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{stats.this_month}</div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.completed}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Inquiries Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">👥 Customer Inquiries</CardTitle>
                  <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Loading inquiries...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">Customer</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Roof Type</th>
                          <th className="text-left p-3 font-medium">Dimensions</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.map((inquiry) => (
                          <tr key={inquiry.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono">#{inquiry.id.toString().padStart(6, "0")}</td>
                            <td className="p-3 font-medium">{inquiry.customer_name}</td>
                            <td className="p-3 text-blue-600">{inquiry.customer_email}</td>
                            <td className="p-3">{inquiry.roof_type}</td>
                            <td className="p-3">
                              {(inquiry.length / 1000).toFixed(1)}×{(inquiry.width / 1000).toFixed(1)}×
                              {(inquiry.height / 1000).toFixed(1)}m
                            </td>
                            <td className="p-3">
                              <Badge className={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                            </td>
                            <td className="p-3 text-gray-600">{formatDate(inquiry.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {inquiries.length === 0 && (
                      <div className="text-center py-8 text-gray-500">No inquiries found for the selected status.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AGENTS SECTION */}
          <TabsContent value="agents" className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">🏢</span>
                <h2 className="text-lg font-semibold text-green-900">Partner Agent Management</h2>
              </div>
              <p className="text-green-700 text-sm">
                Manage patio builders, designers, and suppliers who embed your 3D designer on their websites. Each agent
                gets a unique URL and branded experience.
              </p>
            </div>

            {/* Agent Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{agents.length}</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {agents.filter((a) => a.status === "active").length}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Premium Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      agents.filter((a) => a.subscription_type === "premium" || a.subscription_type === "enterprise")
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agents Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">🏢 Partner Agents</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={fetchAgents} variant="outline" size="sm" disabled={agentsLoading}>
                      {agentsLoading ? "Loading..." : "Refresh"}
                    </Button>
                    <Button onClick={() => setShowAddAgent(true)} className="bg-green-600 hover:bg-green-700">
                      ➕ Add New Agent
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {agentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                    Loading agents...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Company</th>
                          <th className="text-left p-3 font-medium">Contact</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Customer URL</th>
                          <th className="text-left p-3 font-medium">Subscription</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Created</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent) => (
                          <tr key={agent.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium">{agent.company_name}</div>
                              {agent.website && (
                                <a
                                  href={agent.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  🌐 Website
                                </a>
                              )}
                            </td>
                            <td className="p-3">
                              <div>{agent.contact_name}</div>
                              {agent.phone && <div className="text-xs text-gray-500">{agent.phone}</div>}
                            </td>
                            <td className="p-3 text-blue-600">{agent.email}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">/{agent.url_slug}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(`https://aussie-patio-designer.vercel.app/${agent.url_slug}`)
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  📋
                                </Button>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge className={getSubscriptionColor(agent.subscription_type)}>
                                {agent.subscription_type}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge className={getAgentStatusColor(agent.status)}>{agent.status}</Badge>
                            </td>
                            <td className="p-3 text-gray-600">{formatDate(agent.created_at)}</td>
                            <td className="p-3">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {agents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">🏢</div>
                        <p className="text-lg font-medium mb-2">No agents found</p>
                        <p className="text-sm mb-4">Start by adding your first partner agent</p>
                        <Button onClick={() => setShowAddAgent(true)} className="bg-green-600 hover:bg-green-700">
                          ➕ Add First Agent
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddAgentModal isOpen={showAddAgent} onClose={() => setShowAddAgent(false)} onSubmit={handleAddAgent} />
      </div>
    </div>
  )
}
