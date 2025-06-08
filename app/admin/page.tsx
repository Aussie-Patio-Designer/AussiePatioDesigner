"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CopyButton } from "@/components/copy-button"

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
  agent_id?: string
}

interface Agent {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  sales_email: string
  phone?: string
  website?: string
  commission_rate?: number
  status: "active" | "inactive" | "pending"
  created_at: string
  total_inquiries?: number
  total_revenue?: number
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
  const [selectedTab, setSelectedTab] = useState("inquiries")
  const [agents, setAgents] = useState<Agent[]>([])
  const [newAgent, setNewAgent] = useState<Omit<Agent, "id" | "created_at" | "total_inquiries" | "total_revenue">>({
    company_name: "",
    contact_name: "",
    contact_email: "",
    sales_email: "",
    phone: "",
    website: "",
    commission_rate: 0,
    status: "pending",
  })
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)
  const [editedAgent, setEditedAgent] = useState<Agent | null>(null)

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

      // Fetch agents
      const agentsResponse = await fetch("/api/admin/agents")
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json()
        setAgents(agentsData.agents || [])
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewAgent((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateAgent = async () => {
    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAgent),
      })

      if (response.ok) {
        toast.success("Agent created successfully!")
        fetchData() // Refresh agent list
        setNewAgent({
          company_name: "",
          contact_name: "",
          contact_email: "",
          sales_email: "",
          phone: "",
          website: "",
          commission_rate: 0,
          status: "pending",
        }) // Reset form
      } else {
        const errorData = await response.json()
        toast.error(`Failed to create agent: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      toast.error("Error creating agent.")
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgentId(agent.id)
    setEditedAgent({ ...agent })
  }

  const handleEditedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedAgent((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateAgent = async () => {
    if (!editedAgent) return

    try {
      const response = await fetch(`/api/admin/agents/${editedAgent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedAgent),
      })

      if (response.ok) {
        toast.success("Agent updated successfully!")
        fetchData() // Refresh agent list
        setEditingAgentId(null)
        setEditedAgent(null)
      } else {
        const errorData = await response.json()
        toast.error(`Failed to update agent: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error updating agent:", error)
      toast.error("Error updating agent.")
    }
  }

  const handleCancelEdit = () => {
    setEditingAgentId(null)
    setEditedAgent(null)
  }

  const generateEmbedCode = (agentId: string) => {
    return `<iframe src="${process.env.NEXT_PUBLIC_BASE_URL}/embed/${agentId}" width="600" height="400"></iframe>`
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

        {/* Agent Management Section */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Agent List Table */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Agent List</h2>
                <Button onClick={fetchData} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Sales Email</TableHead>
                    <TableHead>Embed URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>{agent.contact_name}</TableCell>
                      <TableCell>{agent.company_name}</TableCell>
                      <TableCell>{agent.sales_email}</TableCell>
                      <TableCell>
                        <CopyButton text={generateEmbedCode(agent.id)} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{agent.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEditAgent(agent)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Add New Agent Form */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Add New Agent</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={newAgent.company_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    type="text"
                    id="contact_name"
                    name="contact_name"
                    value={newAgent.contact_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value={newAgent.contact_email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="sales_email">Sales Email</Label>
                  <Input
                    type="email"
                    id="sales_email"
                    name="sales_email"
                    value={newAgent.sales_email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input type="tel" id="phone" name="phone" value={newAgent.phone || ""} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    type="url"
                    id="website"
                    name="website"
                    value={newAgent.website || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="commission_rate">Commission Rate</Label>
                  <Input
                    type="number"
                    id="commission_rate"
                    name="commission_rate"
                    value={newAgent.commission_rate || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleCreateAgent}>
                Create Agent
              </Button>
            </div>

            {/* Edit Agent Form */}
            {editingAgentId && editedAgent && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Edit Agent</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_company_name">Company Name</Label>
                    <Input
                      type="text"
                      id="edit_company_name"
                      name="company_name"
                      value={editedAgent.company_name}
                      onChange={handleEditedInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_contact_name">Contact Name</Label>
                    <Input
                      type="text"
                      id="edit_contact_name"
                      name="contact_name"
                      value={editedAgent.contact_name}
                      onChange={handleEditedInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_contact_email">Contact Email</Label>
                    <Input
                      type="email"
                      id="edit_contact_email"
                      name="contact_email"
                      value={editedAgent.contact_email}
                      onChange={handleEditedInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_sales_email">Sales Email</Label>
                    <Input
                      type="email"
                      id="edit_sales_email"
                      name="sales_email"
                      value={editedAgent.sales_email}
                      onChange={handleEditedInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_phone">Phone</Label>
                    <Input
                      type="tel"
                      id="edit_phone"
                      name="phone"
                      value={editedAgent.phone || ""}
                      onChange={handleEditedInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_website">Website</Label>
                    <Input
                      type="url"
                      id="edit_website"
                      name="website"
                      value={editedAgent.website || ""}
                      onChange={handleEditedInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_commission_rate">Commission Rate</Label>
                    <Input
                      type="number"
                      id="edit_commission_rate"
                      name="commission_rate"
                      value={editedAgent.commission_rate || 0}
                      onChange={handleEditedInputChange}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateAgent}>Update Agent</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
