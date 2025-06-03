"use client"

import { useState, useCallback } from "react"
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
import { CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"

// Lazy load the 3D preview for better initial page load
const GazeboPreview = dynamic(() => import("./optimized-gazebo-preview"), {
  loading: () => (
    <div className="h-full w-full bg-gradient-to-b from-blue-100 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading 3D Preview...</p>
      </div>
    </div>
  ),
  ssr: false,
})

// Optimized form schema with better validation
const formSchema = z.object({
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),

  siteAddress: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),

  customerEmail: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email must be less than 254 characters"),

  roofType: z.enum(["Gable", "Skillion"]).default("Gable"),
  roofCladding: z.enum(["Corrugated", "Trimclad"]).default("Corrugated"),

  roofPitch: z
    .number()
    .min(2, "Minimum pitch is 2°")
    .max(20, "Maximum pitch is 20°")
    .default(10)
    .refine((val, ctx) => {
      const roofType = ctx.parent?.roofType || "Gable"
      if (roofType === "Gable") {
        return val >= 10 && val <= 20
      } else {
        return val >= 2 && val <= 5
      }
    }, "Invalid pitch for selected roof type"),

  length: z.number().min(1000, "Minimum length is 1000mm").max(20000, "Maximum length is 20000mm").default(3000),

  width: z.number().min(1000, "Minimum width is 1000mm").max(20000, "Maximum width is 20000mm").default(3000),

  height: z.number().min(1000, "Minimum height is 1000mm").max(5000, "Maximum height is 5000mm").default(2400),

  roofColor: z.string().min(1, "Roof color is required").default("SURFMIST / BASALT"),
  postBeamColor: z.string().min(1, "Frame color is required").default("MONUMENT"),
})

type FormData = z.infer<typeof formSchema>

// Memoized color options for better performance
const roofColors = [
  { value: "SURFMIST / BASALT", label: "SURFMIST / BASALT", color: "#4A4A4A" },
  { value: "SURFMIST / CLASSIC CREAM", label: "SURFMIST / CLASSIC CREAM", color: "#F4F0E0" },
  { value: "SURFMIST / DUNE", label: "SURFMIST / DUNE", color: "#C4B08A" },
  { value: "SURFMIST / MANOR RED", label: "SURFMIST / MANOR RED", color: "#8B3A32" },
  { value: "SURFMIST / PALE EUCALYPT", label: "SURFMIST / PALE EUCALYPT", color: "#9CAA8E" },
  { value: "SURFMIST / PAPERBARK", label: "SURFMIST / PAPERBARK", color: "#D4C4A0" },
  { value: "SURFMIST / SHALE GREY", label: "SURFMIST / SHALE GREY", color: "#7A7A7A" },
  { value: "SURFMIST / SURFMIST", label: "SURFMIST / SURFMIST", color: "#E8E0D0" },
  { value: "SURFMIST / WOODLAND GREY", label: "SURFMIST / WOODLAND GREY", color: "#5A5A4A" },
]

const postBeamColors = [
  { value: "CLASSIC CREAM", label: "CLASSIC CREAM", color: "#F4F0E0" },
  { value: "DUNE", label: "DUNE", color: "#C4B08A" },
  { value: "GALVANISED", label: "GALVANISED", color: "#B0B4B8" },
  { value: "MONUMENT", label: "MONUMENT", color: "#3A3A3A" },
  { value: "PAPERBARK", label: "PAPERBARK", color: "#D4C4A0" },
  { value: "DOVER WHITE", label: "DOVER WHITE", color: "#F8F8F4" },
  { value: "WOODLAND GREY", label: "WOODLAND GREY", color: "#5A5A4A" },
]

const roofCladdingOptions = [
  {
    value: "Corrugated",
    label: "Corrugated Colorbond",
    description: "Classic rounded corrugated profile - traditional and cost-effective",
  },
  {
    value: "Trimclad",
    label: "Trimclad Colorbond",
    description: "Modern trapezoidal profile - contemporary industrial look",
  },
]

export default function OptimizedGazeboInquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<"design" | "customer">("design")

  // Optimized form with better performance
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      siteAddress: "",
      customerEmail: "",
      roofType: "Gable",
      roofCladding: "Corrugated",
      roofPitch: 10,
      length: 3000,
      width: 3000,
      height: 2400,
      roofColor: "SURFMIST / BASALT",
      postBeamColor: "MONUMENT",
    },
    mode: "onChange", // Validate on change for better UX
  })

  // Memoized form values for 3D preview
  const formValues = form.watch()

  // Optimized submit handler with better error handling
  const onSubmit = useCallback(
    async (values: FormData) => {
      setIsSubmitting(true)
      setSubmitStatus(null)

      try {
        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        const result = await response.json()

        if (result.success) {
          setSubmitStatus({
            type: "success",
            message: result.message + (result.emailSent ? "" : " Note: Email confirmation may be delayed."),
          })

          // Reset form after successful submission
          setTimeout(() => {
            form.reset()
            setSubmitStatus(null)
            setCurrentStep("design")
          }, 5000)
        } else {
          setSubmitStatus({
            type: "error",
            message: result.message || "Failed to submit inquiry. Please try again.",
          })
        }
      } catch (error) {
        console.error("Submission error:", error)
        setSubmitStatus({
          type: "error",
          message: "Network error occurred. Please check your connection and try again.",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [form],
  )

  // Memoized step navigation
  const proceedToCustomerDetails = useCallback(() => {
    setCurrentStep("customer")
  }, [])

  const backToDesign = useCallback(() => {
    setCurrentStep("design")
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* 3D Background with optimized loading */}
      <div className="fixed inset-0 z-0">
        <GazeboPreview
          length={formValues.length}
          width={formValues.width}
          height={formValues.height}
          roofType={formValues.roofType}
          roofPitch={formValues.roofPitch}
          roofCladding={formValues.roofCladding}
          hasOverhang={false}
          overhangSides={[]}
          overhangSize={300}
          roofColor={formValues.roofColor}
          postBeamColor={formValues.postBeamColor}
        />
      </div>

      {/* Status message */}
      {submitStatus && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            submitStatus.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            {submitStatus.type === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <h3 className="text-lg font-semibold">{submitStatus.type === "success" ? "Success!" : "Error"}</h3>
              <p className="text-gray-600">{submitStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Left Sidebar Form */}
      <div className="fixed left-0 top-0 z-10 w-96 h-screen bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200/50">
          <h1 className="text-2xl font-bold text-gray-900">Aussie Patio Designer</h1>
          <p className="text-sm text-gray-600">Design your perfect patio</p>
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
                                  defaultValue={field.value}
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
                                          <h4 className="text-sm font-medium text-gray-900">{option.label}</h4>
                                          <p className="text-xs text-gray-600">{option.description}</p>
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
                              <FormLabel className="text-sm font-medium">Roof Pitch</FormLabel>
                              <FormControl>
                                <Tabs
                                  value={field.value?.toString() || (formValues.roofType === "Gable" ? "10" : "5")}
                                  onValueChange={(value) => field.onChange(Number(value))}
                                >
                                  <TabsList className="grid grid-cols-3 w-full">
                                    {formValues.roofType === "Gable" ? (
                                      <>
                                        <TabsTrigger value="10" className="text-sm">
                                          10°
                                        </TabsTrigger>
                                        <TabsTrigger value="15" className="text-sm">
                                          15°
                                        </TabsTrigger>
                                        <TabsTrigger value="20" className="text-sm">
                                          20°
                                        </TabsTrigger>
                                      </>
                                    ) : (
                                      <>
                                        <TabsTrigger value="2" className="text-sm">
                                          2°
                                        </TabsTrigger>
                                        <TabsTrigger value="3.5" className="text-sm">
                                          3.5°
                                        </TabsTrigger>
                                        <TabsTrigger value="5" className="text-sm">
                                          5°
                                        </TabsTrigger>
                                      </>
                                    )}
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
                                  max={20000}
                                  step={100}
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
                                  max={20000}
                                  step={100}
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
                                  max={5000}
                                  step={100}
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      disabled={!form.formState.isValid}
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
                                <Input
                                  placeholder="Enter your full name"
                                  {...field}
                                  className="text-sm"
                                  autoComplete="name"
                                />
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
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                  className="text-sm"
                                  autoComplete="email"
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
                                  autoComplete="street-address"
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
                        disabled={isSubmitting || !form.formState.isValid}
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
      </div>
    </div>
  )
}
