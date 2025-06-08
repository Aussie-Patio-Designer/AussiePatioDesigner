"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (agentData: any) => void
}

export function AddAgentModal({ isOpen, onClose, onSubmit }: AddAgentModalProps) {
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    logo_url: "",
    url_slug: "",
    subscription_type: "basic",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateUrlSlug = (companyName: string) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50)
  }

  const handleCompanyNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      company_name: value,
      url_slug: generateUrlSlug(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        website: "",
        logo_url: "",
        url_slug: "",
        subscription_type: "basic",
      })
    } catch (error) {
      console.error("Error submitting agent:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Add New Agent</CardTitle>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  required
                  placeholder="ABC Patio Builders"
                />
              </div>

              <div>
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
                  required
                  placeholder="John Smith"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="john@abcpatios.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+61 400 000 000"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://abcpatios.com"
                />
              </div>

              <div>
                <Label htmlFor="subscription_type">Subscription Type</Label>
                <Select
                  value={formData.subscription_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, subscription_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="url_slug">URL Slug *</Label>
              <Input
                id="url_slug"
                value={formData.url_slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, url_slug: e.target.value }))}
                required
                placeholder="abc-patio-builders"
              />
              <p className="text-sm text-gray-600 mt-1">
                Customer URL: https://aussie-patio-designer.vercel.app/{formData.url_slug}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Agent"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
