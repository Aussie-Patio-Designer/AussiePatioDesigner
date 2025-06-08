"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface Agent {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  sales_email: string
  phone?: string
  website?: string
  status: "active" | "inactive" | "pending"
  created_at: string
  total_inquiries?: number
  total_revenue?: number
  name: string // Agent name for URL
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    sales_email: "",
    phone: "",
    website: "",
    status: "active" as "active" | "inactive" | "pending",
    name: "", // Agent name for URL
  })
  const [selectedAgentForEmbed, setSelectedAgentForEmbed] = useState<Agent | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/agents")
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingAgent ? `/api/admin/agents/${editingAgent.id}` : "/api/admin/agents"
      const method = editingAgent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAgents()
        setIsDialogOpen(false)
        resetForm()
        alert(editingAgent ? "Agent updated successfully!" : "Agent created successfully!")
      } else {
        const error = await response.json()
        alert("Error: " + (error.message || "Failed to save agent"))
      }
    } catch (error) {
      console.error("Error saving agent:", error)
      alert("Error saving agent")
    }
  }

  const handleDelete = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAgents()
        alert("Agent deleted successfully!")
      } else {
        alert("Error deleting agent")
      }
    } catch (error) {
      console.error("Error deleting agent:", error)
      alert("Error deleting agent")
    }
  }

  const resetForm = () => {
    setFormData({
      company_name: "",
      contact_name: "",
      contact_email: "",
      sales_email: "",
      phone: "",
      website: "",
      status: "active",
      name: "",
    })
    setEditingAgent(null)
  }

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      company_name: agent.company_name,
      contact_name: agent.contact_name,
      contact_email: agent.contact_email,
      sales_email: agent.sales_email,
      phone: agent.phone || "",
      website: agent.website || "",
      status: agent.status,
      name: agent.name,
    })
    setIsDialogOpen(true)
  }

  const copyAgentUrl = (agentId: string) => {
    const baseUrl = window.location.origin
    const agentUrl = `${baseUrl}/?agent=${agentId}`
    navigator.clipboard.writeText(agentUrl)
    alert("Agent URL copied to clipboard!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const generateEmbedUrl = (agent: Agent) => {
    return `${window.location.origin}/embed?agent=${agent.name}`
  }

  const generateEmbedCode = (agent: Agent) => {
    const embedUrl = generateEmbedUrl(agent)
    return `<iframe src="${embedUrl}" width="600" height="400"></iframe>
            <script src="${window.location.origin}/embed-script.js"></script>`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Embed code copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Agent Management</h2>
          <p className="text-gray-600">Manage your sales agents and their inquiry routing</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Agent
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sales_email">Sales Email *</Label>
                  <Input
                    id="sales_email"
                    type="email"
                    value={formData.sales_email}
                    onChange={(e) => setFormData({ ...formData, sales_email: e.target.value })}
                    required
                    placeholder="Where inquiries will be sent"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Agent Name (for URL) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="agent-name"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingAgent ? "Update Agent" : "Create Agent"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Sales Email</TableHead>
            <TableHead>Embed URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.name}</TableCell>
              <TableCell>{agent.company_name}</TableCell>
              <TableCell>{agent.sales_email}</TableCell>
              <TableCell>
                <Input type="text" readOnly value={generateEmbedUrl(agent)} />
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(agent.status)}>{agent.status}</Badge>
              </TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateEmbedCode(agent))}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Embed Code
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEditDialog(agent)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(agent.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {agents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500 mb-4">No agents found</div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Agent
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Embed Code Dialog */}
      <Dialog open={selectedAgentForEmbed !== null} onOpenChange={() => setSelectedAgentForEmbed(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Embed Agent</DialogTitle>
          </DialogHeader>
          {selectedAgentForEmbed && (
            <div className="space-y-4">
              <div>
                <Label>Embed URL</Label>
                <Input type="text" readOnly value={generateEmbedUrl(selectedAgentForEmbed)} />
              </div>
              <div>
                <Label>Embed Code</Label>
                <Textarea readOnly value={generateEmbedCode(selectedAgentForEmbed)} className="resize-none" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedAgentForEmbed(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => copyToClipboard(generateEmbedCode(selectedAgentForEmbed))}>
                  Copy Embed Code
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
