"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

const formSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  siteAddress: z.string().min(10, "Address must be at least 10 characters"),
  additionalDetails: z.string().optional(),
  roofType: z.enum(["Gable", "Skillion"]).default("Gable"),
  roofCladding: z.enum(["Corrugated", "Trimclad"]).default("Corrugated"),
  roofPitch: z.number().min(2).max(22.5).default(15),
  length: z.number().min(1000).max(20000).default(3000),
  width: z.number().min(1000).max(20000).default(3000),
  height: z.number().min(2400).max(5000).default(2400),
  roofColor: z.string().min(1, "Roof color is required").default("SURFMIST / BASALT"),
  postBeamColor: z.string().min(1, "Frame color is required").default("MONUMENT"),
})

const roofColors = [
  { value: "SURFMIST / BASALT", label: "SURFMIST / BASALT", color: "#2C2E33" },
  { value: "SURFMIST / CLASSIC CREAM", label: "SURFMIST / CLASSIC CREAM", color: "#F4F0E6" },
  { value: "SURFMIST / DUNE", label: "SURFMIST / DUNE", color: "#C7B299" },
  { value: "SURFMIST / MANOR RED", label: "SURFMIST / MANOR RED", color: "#8B2635" },
  { value: "SURFMIST / PALE EUCALYPT", label: "SURFMIST / PALE EUCALYPT", color: "#A8B5A0" },
  { value: "SURFMIST / PAPERBARK", label: "SURFMIST / PAPERBARK", color: "#D4C5A8" },
  { value: "SURFMIST / SHALE GREY", label: "SURFMIST / SHALE GREY", color: "#5A6670" },
  { value: "SURFMIST / SURFMIST", label: "SURFMIST / SURFMIST", color: "#F0EDE5" },
  { value: "SURFMIST / WOODLAND GREY", label: "SURFMIST / WOODLAND GREY", color: "#3E4A47" },
]

const postBeamColors = [
  { value: "CLASSIC CREAM", label: "CLASSIC CREAM", color: "#F4F0E6" },
  { value: "DUNE", label: "DUNE", color: "#C7B299" },
  { value: "GALVANISED", label: "GALVANISED", color: "#B8BCC0" },
  { value: "MONUMENT", label: "MONUMENT", color: "#2C2E33" },
  { value: "PAPERBARK", label: "PAPERBARK", color: "#D4C5A8" },
  { value: "DOVER WHITE", label: "DOVER WHITE", color: "#FEFEFE" },
  { value: "WOODLAND GREY", label: "WOODLAND GREY", color: "#3E4A47" },
]

const roofCladdingOptions = [
  {
    value: "Corrugated",
    label: "Corrugated Colorbond",
    description: "Classic rounded corrugated profile",
  },
  {
    value: "Trimclad",
    label: "Trimclad Colorbond",
    description: "Modern trapezoidal profile",
  },
]

export default function EmbedForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [agentInfo, setAgentInfo] = useState<any>(null)

  const searchParams = useSearchParams()
  const agentParam = searchParams?.get("agent")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      siteAddress: "",
      additionalDetails: "",
      roofType: "Gable",
      roofCladding: "Corrugated",
      roofPitch: 15,
      length: 3000,
      width: 3000,
      height: 2400,
      roofColor: "SURFMIST / BASALT",
      postBeamColor: "MONUMENT",
    },
  })

  // Fetch agent info if agent parameter is present
  useEffect(() => {
    if (agentParam) {
      fetchAgentInfo(agentParam)
    }
  }, [agentParam])

  const fetchAgentInfo = async (agentName: string) => {
    try {
      const response = await fetch(`/api/agents/by-name/${agentName}`)
      if (response.ok) {
        const data = await response.json()
        setAgentInfo(data.agent)
      }
    } catch (error) {
      console.error("Error fetching agent info:", error)
    }
  }

  const validateRoofPitch = (pitch: number, roofType: string) => {
    if (roofType === "Gable") {
      return pitch === 15 || pitch === 22.5
    } else if (roofType === "Skillion") {
      return pitch === 2 || pitch === 5
    }
    return true
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitStatus(null)
    setShowSubmitModal(true)

    try {
      if (!validateRoofPitch(values.roofPitch, values.roofType)) {
        const errorMessage =
          values.roofType === "Gable" ? "Gable roof pitch must be 15° or 22.5°" : "Skillion roof pitch must be 2° or 5°"
        form.setError("roofPitch", { message: errorMessage })
        setIsSubmitting(false)
        setShowSubmitModal(false)
        return
      }

      const submissionData = {
        ...values,
        hasOverhang: false,
        overhangSides: [],
        overhangSize: 0,
        agentId: agentInfo?.id || null,
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: "Your inquiry has been submitted successfully! You should receive a confirmation email shortly.",
        })

        setTimeout(() => {
          setShowSubmitModal(false)
          form.reset()
          setSubmitStatus(null)
        }, 5000)
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "Failed to submit inquiry. Please try again.",
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error occurred. Please check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPitchOptions = (roofType: string) => {
    if (roofType === "Gable") {
      return [
        { value: "15", label: "15°" },
        { value: "22.5", label: "22.5°" },
      ]
    } else {
      return [
        { value: "2", label: "2°" },
        { value: "5", label: "5°" },
      ]
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {agentInfo ? `${agentInfo.company_name} - Patio Designer` : "Aussie Patio Designer"}
        </h1>
        <p className="text-gray-600">Design your perfect patio/gazebo and get a quote</p>
        {agentInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Powered by {agentInfo.company_name}</strong>
              <br />
              Your inquiry will be handled by our professional team
            </p>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {isSubmitting ? "Submitting Your Inquiry..." : submitStatus?.type === "success" ? "Success!" : "Error"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-6">
            {isSubmitting ? (
              <>
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Processing your patio design...</p>
                  <p className="text-sm text-gray-600 mt-2">
                    We're sending your inquiry to our team for a personalized quote.
                  </p>
                </div>
              </>
            ) : submitStatus?.type === "success" ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Inquiry Submitted Successfully!</p>
                  <p className="text-sm text-gray-600 mt-2">{submitStatus.message}</p>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>What happens next?</strong>
                      <br />• You'll receive a confirmation email shortly
                      <br />• Our team will review your design
                      <br />• We'll contact you within 24 hours with a quote
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-600" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Submission Failed</p>
                  <p className="text-sm text-gray-600 mt-2">{submitStatus?.message}</p>
                  <div className="mt-4">
                    <Button onClick={() => setShowSubmitModal(false)} variant="outline" className="w-full">
                      Try Again
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Patio/Gazebo Design Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installation Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter the installation address..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific requirements or questions about your project..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Design Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="roofType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roof Type</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Gable" id="gable" />
                            <Label htmlFor="gable">Gable (Traditional peaked)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Skillion" id="skillion" />
                            <Label htmlFor="skillion">Skillion (Single slope)</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roofCladding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roof Cladding</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                          {roofCladdingOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <Label htmlFor={option.value} className="flex-1">
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.description}</div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1000}
                          max={20000}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1000}
                          max={20000}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eave Height (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2400}
                          max={5000}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="roofColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roof Color</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select roof color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roofColors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded border border-gray-300 mr-2"
                                  style={{ backgroundColor: color.color }}
                                />
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postBeamColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frame Color</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frame color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {postBeamColors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded border border-gray-300 mr-2"
                                  style={{ backgroundColor: color.color }}
                                />
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>Generated by Gazi OGUTCU 2025</p>
      </div>
    </div>
  )
}
