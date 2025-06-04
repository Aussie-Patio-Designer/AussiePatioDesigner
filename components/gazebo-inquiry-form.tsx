"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import GazeboPreview from "@/components/gazebo-preview"
import type { GazeboPreviewRef } from "./gazebo-preview"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import ARView from "@/components/ar-view"
import { useMobile } from "@/hooks/use-mobile"
import { Camera } from "lucide-react"

// Fixed form schema with proper validation
const formSchema = z
  .object({
    customerName: z.string().min(2, {
      message: "Customer Name must be at least 2 characters.",
    }),
    siteAddress: z.string().min(10, {
      message: "Site Address must be at least 10 characters.",
    }),
    customerEmail: z.string().email({
      message: "Please enter a valid email address.",
    }),
    customerPhone: z.string().min(10, {
      message: "Phone number must be at least 10 digits.",
    }),
    additionalDetails: z.string().optional(),
    roofType: z.enum(["Gable", "Skillion"]).default("Gable"),
    roofCladding: z.enum(["Corrugated", "Trimclad"]).default("Corrugated"),
    roofPitch: z.number().min(2).max(20).default(10),
    length: z.number().min(1000).max(20000).default(3000),
    width: z.number().min(1000).max(20000).default(3000),
    height: z.number().min(1000).max(5000).default(2400),
    roofColor: z.string().min(1, "Roof color is required").default("SURFMIST / BASALT"),
    postBeamColor: z.string().min(1, "Frame color is required").default("MONUMENT"),
  })
  .refine(
    (data) => {
      // Validate roof pitch based on roof type
      if (data.roofType === "Gable") {
        return data.roofPitch >= 10 && data.roofPitch <= 20
      } else if (data.roofType === "Skillion") {
        return data.roofPitch >= 2 && data.roofPitch <= 5
      }
      return true
    },
    {
      message: "Invalid roof pitch for selected roof type. Gable: 10-20°, Skillion: 2-5°",
      path: ["roofPitch"],
    },
  )

// Color options - Updated with exact colors from the color chart
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

// Simplified roof cladding options - only 2 options
const roofCladdingOptions = [
  {
    value: "Corrugated",
    label: "Corrugated Colorbond",
    description: "Classic rounded corrugated profile - traditional and cost-effective",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Corrugated_CB_Surfmist_RoofWall-003-AFtg3cmwP72VCuqLVGrLhW4EP1GRKz.webp",
  },
  {
    value: "Trimclad",
    label: "Trimclad Colorbond",
    description: "Modern trapezoidal profile - contemporary industrial look",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trimclad_Cb_Surfmist_RoofWall-002-2C4NSajHb5KDRUZxElxmIz7XxLamum.webp",
  },
]

export default function GazeboInquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<"design" | "customer">("design")
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState<string>("")
  const [showARView, setShowARView] = useState(false)
  const isMobile = useMobile()

  const searchParams = useSearchParams()
  const gazeboPreviewRef = useRef<GazeboPreviewRef>(null)

  // Pure function to extract URL parameters without side effects
  const extractUrlParams = useMemo(() => {
    if (!searchParams) return null

    return {
      roofType: (searchParams.get("roofType") as "Gable" | "Skillion") || "Gable",
      roofCladding: (searchParams.get("roofCladding") as "Corrugated" | "Trimclad") || "Corrugated",
      roofPitch: Number(searchParams.get("roofPitch")) || 10,
      length: Number(searchParams.get("length")) || 3000,
      width: Number(searchParams.get("width")) || 3000,
      height: Number(searchParams.get("height")) || 2400,
      roofColor: searchParams.get("roofColor") || "SURFMIST / BASALT",
      postBeamColor: searchParams.get("postBeamColor") || "MONUMENT",
      isDesignView: searchParams.get("design") === "true",
      ref: searchParams.get("ref"),
    }
  }, [searchParams])

  // Default form values
  const defaultFormValues = useMemo(() => {
    const urlParams = extractUrlParams

    if (urlParams) {
      return {
        customerName: "",
        siteAddress: "",
        customerEmail: "",
        customerPhone: "",
        additionalDetails: "",
        roofType: urlParams.roofType,
        roofCladding: urlParams.roofCladding,
        roofPitch: urlParams.roofPitch,
        length: urlParams.length,
        width: urlParams.width,
        height: urlParams.height,
        roofColor: urlParams.roofColor,
        postBeamColor: urlParams.postBeamColor,
      }
    }

    return {
      customerName: "",
      siteAddress: "",
      customerEmail: "",
      customerPhone: "",
      additionalDetails: "",
      roofType: "Gable" as const,
      roofCladding: "Corrugated" as const,
      roofPitch: 10,
      length: 3000,
      width: 3000,
      height: 2400,
      roofColor: "SURFMIST / BASALT",
      postBeamColor: "MONUMENT",
    }
  }, [extractUrlParams])

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  })

  // Handle URL parameters and view mode - separate from form initialization
  useEffect(() => {
    if (extractUrlParams?.isDesignView) {
      setIsViewMode(true)
      if (extractUrlParams.ref) {
        setReferenceNumber(`#${extractUrlParams.ref.padStart(6, "0")}`)
      }

      console.log("🔗 Loaded design from URL:", {
        roofType: extractUrlParams.roofType,
        roofCladding: extractUrlParams.roofCladding,
        roofPitch: extractUrlParams.roofPitch,
        dimensions: `${extractUrlParams.length}x${extractUrlParams.width}x${extractUrlParams.height}`,
        roofColor: extractUrlParams.roofColor,
        postBeamColor: extractUrlParams.postBeamColor,
      })
    }
  }, [extractUrlParams])

  // Handle roof type changes with proper validation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "roofType") {
        const currentPitch = form.getValues("roofPitch")
        const roofType = value.roofType

        // Auto-adjust pitch when roof type changes
        if (roofType === "Gable") {
          if (currentPitch < 10 || currentPitch > 20) {
            form.setValue("roofPitch", 10)
          }
        } else if (roofType === "Skillion") {
          if (currentPitch < 2 || currentPitch > 5) {
            form.setValue("roofPitch", 5)
          }
        }

        // Clear any existing validation errors
        form.clearErrors("roofPitch")
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  // Custom validation function for roof pitch
  const validateRoofPitch = (pitch: number, roofType: string) => {
    if (roofType === "Gable") {
      return pitch >= 10 && pitch <= 20
    } else if (roofType === "Skillion") {
      return pitch >= 2 && pitch <= 5
    }
    return true
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitStatus(null)
    setShowSubmitModal(true) // Show the popup immediately

    try {
      // Additional client-side validation
      if (!validateRoofPitch(values.roofPitch, values.roofType)) {
        const errorMessage =
          values.roofType === "Gable"
            ? "Gable roof pitch must be between 10° and 20°"
            : "Skillion roof pitch must be between 2° and 5°"

        form.setError("roofPitch", { message: errorMessage })
        setIsSubmitting(false)
        setShowSubmitModal(false) // Hide popup on validation error
        return
      }

      // Capture screenshot before submission
      let screenshot: string | null = null
      if (gazeboPreviewRef.current) {
        screenshot = await gazeboPreviewRef.current.captureScreenshot()
        console.log("📸 Screenshot captured:", screenshot ? "Success" : "Failed")
      }

      const submissionData = {
        ...values,
        screenshot: screenshot,
      }

      console.log("🚀 Submitting inquiry:", submissionData.customerEmail)

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
          message: result.message + (result.emailSent ? "" : " Note: Email confirmation may be delayed."),
        })

        console.log("✅ Inquiry submitted successfully")
        console.log("📧 Email sent:", result.emailSent)

        // Auto-close modal and reset form after 5 seconds
        setTimeout(() => {
          setShowSubmitModal(false)
          form.reset()
          setSubmitStatus(null)
          setCurrentStep("design")
          setIsViewMode(false)
          setReferenceNumber("")
        }, 5000)
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "Failed to submit inquiry. Please check your details and try again.",
        })
        console.error("❌ Inquiry submission failed:", result.message)
      }
    } catch (error) {
      console.error("❌ Network error during submission:", error)
      setSubmitStatus({
        type: "error",
        message: "Network error occurred. Please check your internet connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const proceedToCustomerDetails = () => {
    setCurrentStep("customer")
  }

  const backToDesign = () => {
    setCurrentStep("design")
  }

  const startNewDesign = () => {
    form.reset({
      customerName: "",
      siteAddress: "",
      customerEmail: "",
      customerPhone: "",
      additionalDetails: "",
      roofType: "Gable",
      roofCladding: "Corrugated",
      roofPitch: 10,
      length: 3000,
      width: 3000,
      height: 2400,
      roofColor: "SURFMIST / BASALT",
      postBeamColor: "MONUMENT",
    })
    setIsViewMode(false)
    setReferenceNumber("")
    setCurrentStep("design")
  }

  // Get available pitch options based on roof type
  const getPitchOptions = (roofType: string) => {
    if (roofType === "Gable") {
      return [
        { value: "10", label: "10°" },
        { value: "15", label: "15°" },
        { value: "20", label: "20°" },
      ]
    } else {
      return [
        { value: "2", label: "2°" },
        { value: "3.5", label: "3.5°" },
        { value: "5", label: "5°" },
      ]
    }
  }

  const ARButton = () => {
    if (!isMobile) return null

    return (
      <Button
        onClick={() => setShowARView(true)}
        className="fixed bottom-20 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full"
        size="icon"
      >
        <Camera className="h-5 w-5" />
        <span className="sr-only">View in AR</span>
      </Button>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Full-screen 3D Background */}
      <div className="fixed inset-0 z-0">
        <GazeboPreview
          ref={gazeboPreviewRef}
          length={form.watch("length") || 3000}
          width={form.watch("width") || 3000}
          height={form.watch("height") || 2400}
          roofType={form.watch("roofType") || "Gable"}
          roofPitch={form.watch("roofPitch") || 10}
          roofCladding={form.watch("roofCladding") || "Corrugated"}
          hasOverhang={false}
          overhangSides={[]}
          overhangSize={300}
          roofColor={form.watch("roofColor")}
          postBeamColor={form.watch("postBeamColor")}
        />
      </div>

      {/* Credit Footer - Bottom Right Corner */}
      <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200/50">
        <p className="text-xs text-gray-600 font-medium">
          Generated by <span className="text-blue-600 font-semibold">Gazi OGUTCU</span> 2025
        </p>
      </div>

      {/* Submit Modal Popup */}
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
                    We're capturing your 3D design and sending your inquiry to our team.
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

            {submitStatus?.type === "success" && (
              <div className="text-center">
                <p className="text-xs text-gray-500">This window will close automatically in 5 seconds</p>
                <Button
                  onClick={() => {
                    setShowSubmitModal(false)
                    form.reset()
                    setSubmitStatus(null)
                    setCurrentStep("design")
                  }}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                >
                  Start New Design
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Left Sidebar Form */}
      <div className="fixed left-0 top-0 z-10 w-96 h-screen bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200/50">
          <h1 className="text-2xl font-bold text-gray-900">Aussie Patio Designer</h1>
          <p className="text-sm text-gray-600">
            {isViewMode ? `Viewing saved design ${referenceNumber}` : "Design your perfect patio/gazebo"}
          </p>
          {isViewMode && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>This is your saved design!</strong>
                <br />
                You can modify it and submit a new inquiry, or{" "}
                <button onClick={startNewDesign} className="underline font-medium">
                  start a completely new design
                </button>
                .
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === "design" ? (
                  <>
                    {/* Design Configuration */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Design Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="roofType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Roof Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Gable" id="gable" />
                                    <Label htmlFor="gable" className="text-sm">
                                      Gable (Traditional peaked)
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Skillion" id="skillion" />
                                    <Label htmlFor="skillion" className="text-sm">
                                      Skillion (Single slope)
                                    </Label>
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
                              <FormLabel className="text-sm font-medium">Roof Cladding</FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  {roofCladdingOptions.map((option) => (
                                    <div
                                      key={option.value}
                                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                        field.value === option.value
                                          ? "border-blue-500 bg-blue-50"
                                          : "border-gray-200 hover:border-gray-300"
                                      }`}
                                      onClick={() => field.onChange(option.value)}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <input
                                          type="radio"
                                          value={option.value}
                                          checked={field.value === option.value}
                                          onChange={() => field.onChange(option.value)}
                                          className="text-blue-600"
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3">
                                            {option.image && (
                                              <img
                                                src={option.image || "/placeholder.svg"}
                                                alt={option.label}
                                                className="w-12 h-8 object-cover rounded border"
                                              />
                                            )}
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-900">{option.label}</h4>
                                              <p className="text-xs text-gray-600">{option.description}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="roofPitch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Roof Pitch
                                <span className="text-xs text-gray-500 ml-1">
                                  ({form.watch("roofType") === "Gable" ? "10-20°" : "2-5°"})
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Tabs
                                  value={field.value?.toString() || (form.watch("roofType") === "Gable" ? "10" : "5")}
                                  onValueChange={(value) => field.onChange(Number(value))}
                                >
                                  <TabsList className="grid grid-cols-3 w-full">
                                    {getPitchOptions(form.watch("roofType") || "Gable").map((option) => (
                                      <TabsTrigger key={option.value} value={option.value} className="text-sm">
                                        {option.label}
                                      </TabsTrigger>
                                    ))}
                                  </TabsList>
                                </Tabs>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Dimensions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Dimensions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Length (mm)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1000}
                                  placeholder="3000"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="text-sm"
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
                              <FormLabel className="text-sm font-medium">Width (mm)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1000}
                                  placeholder="3000"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="text-sm"
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
                              <FormLabel className="text-sm font-medium">Eave Height (mm)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1000}
                                  placeholder="2400"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Color Selection */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Color Selection</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="roofColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Roof Color</FormLabel>
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
                                        <span className="text-sm">{color.label}</span>
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
                              <FormLabel className="text-sm font-medium">Frame Color</FormLabel>
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
                                        <span className="text-sm">{color.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Continue Button */}
                    <Button
                      type="button"
                      onClick={proceedToCustomerDetails}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    >
                      Continue to Customer Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Customer Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Customer Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Customer Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} className="text-sm" />
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
                              <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} className="text-sm" />
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
                              <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="Enter your phone number"
                                  {...field}
                                  className="text-sm"
                                />
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
                              <FormLabel className="text-sm font-medium">Installation Address</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter the full installation address..."
                                  {...field}
                                  className="min-h-[80px] text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="additionalDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Additional Details</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any specific requirements, preferences, or questions about your patio/gazebo project..."
                                  {...field}
                                  className="min-h-[100px] text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        onClick={backToDesign}
                        variant="outline"
                        className="flex-1 font-semibold py-3"
                      >
                        Back to Design
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </Form>
          </div>
        </div>

        {/* Custom Scrollbar Styling */}
        <style jsx>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.5);
          }
        `}</style>
      </div>

      {/* AR View Dialog */}
      <ARView
        isOpen={showARView}
        onClose={() => setShowARView(false)}
        gazeboProps={{
          length: form.watch("length") || 3000,
          width: form.watch("width") || 3000,
          height: form.watch("height") || 2400,
          roofType: form.watch("roofType") || "Gable",
          roofPitch: form.watch("roofPitch") || 10,
          roofCladding: form.watch("roofCladding") || "Corrugated",
          roofColor: form.watch("roofColor"),
          postBeamColor: form.watch("postBeamColor"),
        }}
      />

      {/* AR Button for mobile */}
      <ARButton />
    </div>
  )
}
