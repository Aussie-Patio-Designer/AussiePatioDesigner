"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Agent {
  id: number
  company_name: string
  contact_name: string
  email: string
  phone: string
  website?: string // Database column name
  logo_url?: string
  url_slug: string
  status: string
  notes?: string
}

interface EditAgentModalProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (agentData: any) => void
}

export function EditAgentModal({ agent, isOpen, onClose, onSubmit }: EditAgentModalProps) {
  const [formData, setFormData] = useState({
    id: 0,
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website_url: "", // Form field name
    logo_url: "",
    url_slug: "",
    status: "active",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Update form data when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        id: agent.id,
        company_name: agent.company_name || "",
        contact_name: agent.contact_name || "",
        email: agent.email || "",
        phone: agent.phone || "",
        website_url: agent.website || "", // Map database 'website' to form 'website_url'
        logo_url: agent.logo_url || "",
        url_slug: agent.url_slug || "",
        status: agent.status || "active",
        notes: agent.notes || "",
      })
    }
  }, [agent])

  // Don't render if no agent is selected
  if (!agent) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error updating agent:", error)
      setError(error instanceof Error ? error.message : "Failed to update agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = (companyName: string) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleCompanyNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      company_name: value,
      url_slug: generateSlug(value),
    }))
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://aussie-patio-designer.vercel.app"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>Update agent information and settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              value={formData.website_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url_slug">URL Slug *</Label>
              <Input
                id="url_slug"
                value={formData.url_slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, url_slug: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Customer URL Preview</Label>
            <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
              {baseUrl}/{formData.url_slug}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Internal notes about this agent..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
