"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Building2, User, Mail, Phone, Globe, Link, CreditCard } from "lucide-react"

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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const generateUrlSlug = (companyName: string) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required"
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = "Contact name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.url_slug.trim()) {
      newErrors.url_slug = "URL slug is required"
    } else if (!/^[a-z0-9-]+$/.test(formData.url_slug)) {
      newErrors.url_slug = "URL slug can only contain lowercase letters, numbers, and hyphens"
    }

    if (formData.website && !formData.website.startsWith("http")) {
      newErrors.website = "Website must start with http:// or https://"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCompanyNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      company_name: value,
      url_slug: generateUrlSlug(value),
    }))
    if (errors.company_name) {
      setErrors((prev) => ({ ...prev, company_name: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

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
      setErrors({})
    } catch (error) {
      console.error("Error submitting agent:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
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
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-green-50 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Add New Partner Agent</CardTitle>
            </div>
            <Button variant="ghost" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Create a new partner account with a unique branded URL for embedding the 3D designer.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Company Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name" className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Company Name *
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    placeholder="ABC Patio Builders"
                    className={errors.company_name ? "border-red-500" : ""}
                  />
                  {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                </div>

                <div>
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://abcpatios.com"
                    className={errors.website ? "border-red-500" : ""}
                  />
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="logo_url" className="flex items-center gap-2">
                  <Image className="h-3 w-3" />
                  Logo URL
                </Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Logo will be displayed on the agent's branded designer page
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <User className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name" className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Contact Name *
                  </Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="John Smith"
                    className={errors.contact_name ? "border-red-500" : ""}
                  />
                  {errors.contact_name && <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+61 400 000 000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john@abcpatios.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                <p className="text-xs text-gray-500 mt-1">Customer inquiries will be sent to this email address</p>
              </div>
            </div>

            {/* System Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Link className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">System Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url_slug" className="flex items-center gap-2">
                    <Link className="h-3 w-3" />
                    URL Slug *
                  </Label>
                  <Input
                    id="url_slug"
                    value={formData.url_slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url_slug: e.target.value }))}
                    placeholder="abc-patio-builders"
                    className={errors.url_slug ? "border-red-500" : ""}
                  />
                  {errors.url_slug && <p className="text-red-500 text-xs mt-1">{errors.url_slug}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Customer URL:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      https://aussie-patio-designer.vercel.app/{formData.url_slug || "your-slug"}
                    </code>
                  </p>
                </div>

                <div>
                  <Label htmlFor="subscription_type" className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3" />
                    Subscription Type
                  </Label>
                  <Select
                    value={formData.subscription_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subscription_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Standard features</SelectItem>
                      <SelectItem value="premium">Premium - Advanced features</SelectItem>
                      <SelectItem value="enterprise">Enterprise - Full customization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "Creating Agent..." : "Create Agent"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
