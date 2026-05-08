"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
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
import { ChevronLeft, ChevronRight } from "lucide-react"
import GazeboPreview from "@/components/gazebo-preview"
import type { GazeboPreviewRef } from "./gazebo-preview"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

// Add this near the top of the file where the props are defined
interface GazeboInquiryFormProps {
  agentData?: {
    id: number
    company_name: string
    contact_name: string
    email: string
    url_slug: string
  }
}

const attachmentMethods = ["wall", "gutter_fascia", "roof_penetration"] as const

type AttachmentOptionValue = (typeof attachmentMethods)[number]

const attachmentOptions: { value: AttachmentOptionValue; label: string; description: string }[] = [
  {
    value: "wall",
    label: "Wall Connection",
    description: "Fix the patio ledger directly to an existing wall or fascia board.",
  },
  {
    value: "gutter_fascia",
    label: "Gutter / Fascia",
    description: "Tie into the existing gutter line with hanger brackets and shared drainage.",
  },
  {
    value: "roof_penetration",
    label: "Roof Penetration",
    description: "Project the patio roof through the existing roof for a seamless enclosure.",
  },
]

const defaultAttachmentType: AttachmentOptionValue = "wall"

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
    roofPitch: z.number().min(2).max(22.5).default(15),
    length: z.number().min(1000).max(20000).default(3000),
    width: z.number().min(1000).max(20000).default(3000),
    height: z.number().min(2400).max(5000).default(2400),
    roofColor: z.string().min(1, "Roof color is required").default("SURFMIST / BASALT"),
    postBeamColor: z.string().min(1, "Frame color is required").default("MONUMENT"),
    isAttached: z.boolean().default(false),
    attachmentType: z.enum(attachmentMethods).nullable().default(null),
  })
  .refine(
    (data) => {
      // Validate roof pitch based on roof type
      if (data.roofType === "Gable") {
        return data.roofPitch === 15 || data.roofPitch === 22.5
      } else if (data.roofType === "Skillion") {
        return data.roofPitch === 2 || data.roofPitch === 5
      }
      return true
    },
    {
      message: "Invalid roof pitch for selected roof type. Gable: 15° or 22.5°, Skillion: 2° or 5°",
      path: ["roofPitch"],
    },
  )
  .superRefine((data, ctx) => {
    if (data.isAttached && !data.attachmentType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["attachmentType"],
        message: "Select how the patio connects to the existing structure.",
      })
    }
  })

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


const DESKTOP_SIDEBAR_WIDTH = 384
const SIDEBAR_STORAGE_KEY = "apd:sidebar-collapsed"

const pitchOptionsByRoofType: Record<"Gable" | "Skillion", { value: string; label: string }[]> = {
  Gable: [
    { value: "15", label: "15° Classic" },
    { value: "22.5", label: "22.5° High Peak" },
  ],
  Skillion: [
    { value: "2", label: "2° Low" },
    { value: "5", label: "5° Standard" },
  ],
}

const getPitchOptions = (roofType: "Gable" | "Skillion") =>
  pitchOptionsByRoofType[roofType] ?? pitchOptionsByRoofType.Gable

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

const designPresets = [
  {
    id: "family-entertainer",
    name: "Family Entertainer",
    description: "Wide covered area for outdoor dining and gatherings.",
    values: {
      roofType: "Gable" as const,
      roofCladding: "Corrugated" as const,
      roofPitch: 15,
      length: 7200,
      width: 4200,
      height: 2700,
      roofColor: "SURFMIST / BASALT",
      postBeamColor: "MONUMENT",
      isAttached: true,
      attachmentType: "wall" as AttachmentOptionValue,
    },
  },
  {
    id: "poolside-shade",
    name: "Poolside Shade",
    description: "Low-profile modern skillion roof ideal for open spaces.",
    values: {
      roofType: "Skillion" as const,
      roofCladding: "Trimclad" as const,
      roofPitch: 5,
      length: 6000,
      width: 3600,
      height: 2600,
      roofColor: "SURFMIST / WOODLAND GREY",
      postBeamColor: "WOODLAND GREY",
      isAttached: false,
      attachmentType: null,
    },
  },
  {
    id: "alfresco-plus",
    name: "Alfresco Plus",
    description: "Balanced attached layout that suits most backyard patios.",
    values: {
      roofType: "Gable" as const,
      roofCladding: "Trimclad" as const,
      roofPitch: 22.5,
      length: 5400,
      width: 3200,
      height: 2550,
      roofColor: "SURFMIST / PAPERBARK",
      postBeamColor: "PAPERBARK",
      isAttached: true,
      attachmentType: "gutter_fascia" as AttachmentOptionValue,
    },
  },
]

// Update the component definition to accept props
export default function GazeboInquiryForm({ agentData }: GazeboInquiryFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<"design" | "customer">("design")
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState<string>("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const searchParams = useSearchParams()
  const gazeboPreviewRef = useRef<GazeboPreviewRef>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (storedValue !== null) {
      setIsSidebarCollapsed(storedValue === "true")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  // Pure function to extract URL parameters without side effects
  const extractUrlParams = useMemo(() => {
    if (!searchParams) return null

    return {
      roofType: (searchParams.get("roofType") as "Gable" | "Skillion") || "Gable",
      roofCladding: (searchParams.get("roofCladding") as "Corrugated" | "Trimclad") || "Corrugated",
      roofPitch: Number(searchParams.get("roofPitch")) || 15,
      length: Number(searchParams.get("length")) || 3000,
      width: Number(searchParams.get("width")) || 3000,
      height: Number(searchParams.get("height")) || 2400,
      roofColor: searchParams.get("roofColor") || "SURFMIST / BASALT",
      postBeamColor: searchParams.get("postBeamColor") || "MONUMENT",
      isDesignView: searchParams.get("design") === "true",
      ref: searchParams.get("ref"),
    }
  }, [searchParams])

  // Default form values - ALWAYS keep customer fields empty
  const defaultFormValues = useMemo(() => {
    const urlParams = extractUrlParams

    // Base customer values - ALWAYS empty
    const customerDefaults = {
      customerName: "",
      siteAddress: "",
      customerEmail: "",
      customerPhone: "",
      additionalDetails: "",
    }

    if (urlParams) {
      return {
        ...customerDefaults, // Always use empty customer defaults
        roofType: urlParams.roofType,
        roofCladding: urlParams.roofCladding,
        roofPitch: urlParams.roofPitch,
        length: urlParams.length,
        width: urlParams.width,
        height: urlParams.height,
        roofColor: urlParams.roofColor,
        postBeamColor: urlParams.postBeamColor,
        isAttached: false,
        attachmentType: null,
      }
    }

    return {
      ...customerDefaults, // Always use empty customer defaults
      roofType: "Gable" as const,
      roofCladding: "Corrugated" as const,
      roofPitch: 15,
      length: 3000,
      width: 3000,
      height: 2400,
      roofColor: "SURFMIST / BASALT",
      postBeamColor: "MONUMENT",
      isAttached: false,
      attachmentType: null,
    }
  }, [extractUrlParams])

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  })

  const isAttachedValue = form.watch("isAttached")
  const attachmentTypeValue = form.watch("attachmentType")

  useEffect(() => {
    if (isAttachedValue) {
      if (!attachmentTypeValue) {
        form.setValue("attachmentType", defaultAttachmentType)
      }
    } else if (attachmentTypeValue) {
      form.setValue("attachmentType", null)
    }
  }, [attachmentTypeValue, form, isAttachedValue])

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

  // Force reset customer fields when switching to customer step
  useEffect(() => {
    if (currentStep === "customer") {
      // Force reset only customer fields to empty strings
      form.setValue("customerName", "")
      form.setValue("customerEmail", "")
      form.setValue("customerPhone", "")
      form.setValue("siteAddress", "")
      form.setValue("additionalDetails", "")
    }
  }, [currentStep, form])

  // Handle roof type changes with proper validation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "roofType") {
        const currentPitch = form.getValues("roofPitch")
        const roofType = value.roofType

        // Auto-adjust pitch when roof type changes
        if (roofType === "Gable") {
          if (currentPitch !== 15 && currentPitch !== 22.5) {
            form.setValue("roofPitch", 15)
          }
        } else if (roofType === "Skillion") {
          if (currentPitch !== 2 && currentPitch !== 5) {
            form.setValue("roofPitch", 5)
          }
        }

        // Clear any existing validation errors
        form.clearErrors("roofPitch")
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  const proceedToCustomerDetails = useCallback(async () => {
    const isValid = await form.trigger(
      ["roofType", "roofCladding", "roofPitch", "length", "width", "height", "roofColor", "postBeamColor"],
      { shouldFocus: true },
    )

    if (isValid) {
      if (isSidebarCollapsed && !isMobile) {
        setIsSidebarCollapsed(false)
      }
      setCurrentStep("customer")
    }
  }, [form, isMobile, isSidebarCollapsed])

  const backToDesign = useCallback(() => {
    setCurrentStep("design")
  }, [])

  const startNewDesign = useCallback(() => {
    setCurrentStep("design")
    setIsViewMode(false)
    setReferenceNumber("")
    setSubmitStatus(null)
    setShowSubmitModal(false)
    form.reset({ ...defaultFormValues })
  }, [defaultFormValues, form])

  const applyDesignPreset = useCallback(
    (presetId: string) => {
      const preset = designPresets.find((item) => item.id === presetId)

      if (!preset) return

      form.setValue("roofType", preset.values.roofType)
      form.setValue("roofCladding", preset.values.roofCladding)
      form.setValue("roofPitch", preset.values.roofPitch)
      form.setValue("length", preset.values.length)
      form.setValue("width", preset.values.width)
      form.setValue("height", preset.values.height)
      form.setValue("roofColor", preset.values.roofColor)
      form.setValue("postBeamColor", preset.values.postBeamColor)
      form.setValue("isAttached", preset.values.isAttached)
      form.setValue("attachmentType", preset.values.attachmentType)

      form.clearErrors([
        "roofType",
        "roofCladding",
        "roofPitch",
        "length",
        "width",
        "height",
        "roofColor",
        "postBeamColor",
        "isAttached",
        "attachmentType",
      ])
    },
    [form],
  )

  const testScreenshot = useCallback(async () => {
    const capture = gazeboPreviewRef.current?.captureScreenshot

    if (!capture) {
      console.error("Screenshot capture is not available on the preview component.")
      return
    }

    try {
      const dataUrl = await capture()

      if (!dataUrl) {
        console.warn("Unable to capture screenshot from the preview.")
        return
      }

      if (typeof window !== "undefined") {
        const previewWindow = window.open("", "_blank")

        if (previewWindow) {
          previewWindow.document.write(
            `<img src="${dataUrl}" alt="Gazebo preview screenshot" style="width:100%;height:auto;" />`,
          )
        } else {
          const link = document.createElement("a")
          link.href = dataUrl
          link.download = "gazebo-preview.png"
          link.click()
        }
      }
    } catch (error) {
      console.error("Error capturing screenshot:", error)
    }
  }, [])

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsSubmitting(true)
      setSubmitStatus(null)
      setShowSubmitModal(true)

      try {
        const screenshot = await gazeboPreviewRef.current?.captureScreenshot?.().catch((error) => {
          console.error("Failed to capture screenshot before submission:", error)
          return null
        })

        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(), 45000)

        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            ...values,
            hasOverhang: false,
            overhangSides: [],
            overhangSize: 0,
            screenshot,
            agentData,
          }),
        }).finally(() => window.clearTimeout(timeoutId))

        const contentType = response.headers.get("content-type") || ""
        const result = contentType.includes("application/json")
          ? await response.json()
          : { message: await response.text() }

        if (!response.ok || !result?.success) {
          const message = result?.message || result?.error || `Failed to submit inquiry (HTTP ${response.status}). Please try again.`
          setSubmitStatus({ type: "error", message })
          return
        }

        const reference = result.inquiryId ? ` Reference #${String(result.inquiryId).padStart(6, "0")}.` : ""
        const deliveryWarning =
          result.salesEmailSent === false
            ? " Email delivery may be delayed, but the quote request was saved."
            : ""
        const successMessage = `${result.message ?? "Inquiry submitted successfully."}${reference}${deliveryWarning}`

        setSubmitStatus({ type: "success", message: successMessage })

        setTimeout(() => {
          setShowSubmitModal(false)
          setSubmitStatus(null)
          setCurrentStep("design")
          setIsViewMode(false)
          setReferenceNumber("")
          form.reset({ ...defaultFormValues })
        }, 5000)
      } catch (error) {
        console.error("Error submitting inquiry:", error)
        const message =
          error instanceof DOMException && error.name === "AbortError"
            ? "The quote request timed out. Please check your connection and try again."
            : "Something went wrong while submitting your inquiry. Please try again."
        setSubmitStatus({
          type: "error",
          message,
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [agentData, defaultFormValues, form],
  )

  const toggleButtonLeft = isSidebarCollapsed ? 16 : DESKTOP_SIDEBAR_WIDTH + 24

  return (
    <div className={`relative min-h-screen ${isMobile ? "bg-slate-100" : ""}`}>
      {/* 3D Preview */}
      {isMobile ? (
        <div className="relative z-0 h-[300px] w-full overflow-hidden shadow-lg sm:h-[360px]">
          <GazeboPreview
            ref={gazeboPreviewRef}
            length={form.watch("length") || 3000}
            width={form.watch("width") || 3000}
            height={form.watch("height") || 2400}
            roofType={form.watch("roofType") || "Gable"}
            roofPitch={form.watch("roofPitch") || 15}
            roofCladding={form.watch("roofCladding") || "Corrugated"}
            hasOverhang={false}
            overhangSides={[]}
            overhangSize={300}
            roofColor={form.watch("roofColor")}
            postBeamColor={form.watch("postBeamColor")}
            isAttached={isAttachedValue}
            attachmentType={attachmentTypeValue ?? undefined}
          />
        </div>
      ) : (
        <div className="fixed inset-0 z-0">
          <GazeboPreview
            ref={gazeboPreviewRef}
            length={form.watch("length") || 3000}
            width={form.watch("width") || 3000}
            height={form.watch("height") || 2400}
            roofType={form.watch("roofType") || "Gable"}
            roofPitch={form.watch("roofPitch") || 15}
            roofCladding={form.watch("roofCladding") || "Corrugated"}
            hasOverhang={false}
            overhangSides={[]}
            overhangSize={300}
            roofColor={form.watch("roofColor")}
            postBeamColor={form.watch("postBeamColor")}
            isAttached={isAttachedValue}
            attachmentType={attachmentTypeValue ?? undefined}
          />
        </div>
      )}

      {!isMobile && (
        <>
          <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-gray-200/50 bg-white/90 px-3 py-2 text-xs font-medium text-gray-600 shadow-lg backdrop-blur-sm">
            Created by <span className="font-semibold text-blue-600">Gazi OGUTCU</span> 2025
          </div>
          <div className="fixed top-4 right-4 z-50">
            <Button
              onClick={testScreenshot}
              variant="secondary"
              className="border border-gray-200/50 bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white/70"
            >
              📸 Screenshot
            </Button>
          </div>
        </>
      )}

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
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Processing your patio design...</p>
                  <p className="mt-2 text-sm text-gray-600">
                    We're capturing your 3D design and sending your inquiry to our team.
                  </p>
                </div>
              </>
            ) : submitStatus?.type === "success" ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Inquiry Submitted Successfully!</p>
                  <p className="mt-2 text-sm text-gray-600">{submitStatus.message}</p>
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
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
                  <p className="mt-2 text-sm text-gray-600">{submitStatus?.message}</p>
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
                  className="mt-3 bg-green-600 text-white hover:bg-green-700"
                >
                  Start New Design
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div
        className="relative z-10 flex flex-col md:flex-row"
        style={!isMobile ? { paddingLeft: isSidebarCollapsed ? 0 : DESKTOP_SIDEBAR_WIDTH } : undefined}
      >
        <div
          id="design-sidebar"
          className={cn(
            "w-full md:w-96",
            isMobile ? "px-4 pb-10 pt-6" : "",
            "md:fixed md:left-0 md:top-0 md:h-screen md:transition-[transform,opacity] md:duration-300 md:ease-in-out",
            isSidebarCollapsed
              ? "md:pointer-events-none md:-translate-x-[calc(100%+1.5rem)] md:opacity-0"
              : "md:translate-x-0 md:opacity-100",
          )}
        >
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl md:mx-0 md:max-w-none md:rounded-none md:bg-white/95 md:backdrop-blur-sm md:shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-gray-200/60 px-5 py-6 sm:px-6 md:gap-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Aussie Patio Designer</h1>
                  <p className="text-sm text-gray-600">
                    {isViewMode ? `Viewing saved design ${referenceNumber}` : "Design your perfect patio/gazebo"}
                  </p>
                </div>
                {isMobile && (
                  <Button onClick={testScreenshot} variant="outline" className="w-full sm:w-auto">
                    📸 Screenshot
                  </Button>
                )}
              </div>
              {isViewMode && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <strong>This is your saved design!</strong>
                  <br />
                  You can modify it and submit a new inquiry, or{" "}
                  <button onClick={startNewDesign} className="font-medium underline">
                    start a completely new design
                  </button>
                  .
                </div>
              )}
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 transition-colors",
                    currentStep === "design"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-500",
                  )}
                >
                  1. Design Details
                </span>
                <ChevronRight className="h-3 w-3 text-gray-300" aria-hidden />
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 transition-colors",
                    currentStep === "customer"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-500",
                  )}
                >
                  2. Customer Info
                </span>
              </div>
            </div>

            <div className={cn("flex-1", !isMobile && "overflow-y-auto")}>
              <div className="px-5 py-6 sm:px-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {currentStep === "design" ? (
                      <>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Design Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 p-3">
                              <div className="mb-2">
                                <h3 className="text-sm font-semibold text-blue-900">Quick Start Presets</h3>
                                <p className="text-xs text-blue-700">
                                  Instantly load a proven layout and continue customizing from there.
                                </p>
                              </div>
                              <div className="grid gap-2">
                                {designPresets.map((preset) => (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => applyDesignPreset(preset.id)}
                                    className="rounded-md border border-blue-200 bg-white px-3 py-2 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                                  >
                                    <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                                    <p className="text-xs text-gray-600">{preset.description}</p>
                                  </button>
                                ))}
                              </div>
                            </div>

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
                                          className={`cursor-pointer rounded-lg border p-3 transition-all ${
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
                                                    className="h-8 w-12 rounded border object-cover"
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
                                    <span className="ml-1 text-xs text-gray-500">
                                      ({form.watch("roofType") === "Gable" ? "15° or 22.5°" : "2° or 5°"})
                                    </span>
                                  </FormLabel>
                                  <FormControl>
                                    <Tabs
                                      value={field.value?.toString() || (form.watch("roofType") === "Gable" ? "15" : "5")}
                                      onValueChange={(value) => field.onChange(Number(value))}
                                    >
                                      <TabsList className="grid w-full grid-cols-2 gap-2">
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

                            <FormField
                              control={form.control}
                              name="isAttached"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="space-y-1">
                                        <FormLabel className="text-sm font-medium">Attach to Existing Structure</FormLabel>
                                        <p className="text-xs text-gray-600">
                                          Remove the house-side posts and mount against an existing wall or roof.
                                        </p>
                                      </div>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          aria-label="Toggle attached mode"
                                        />
                                      </FormControl>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {isAttachedValue && (
                              <FormField
                                control={form.control}
                                name="attachmentType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium">Attachment Method</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value ?? undefined}
                                        className="grid gap-3 sm:grid-cols-3"
                                      >
                                        {attachmentOptions.map((option) => {
                                          const optionId = `attachment-${option.value}`
                                          const isSelected = field.value === option.value

                                          return (
                                            <div
                                              key={option.value}
                                              className={cn(
                                                "cursor-pointer rounded-xl border p-4 text-left shadow-sm transition",
                                                isSelected
                                                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:shadow-md",
                                              )}
                                              onClick={() => field.onChange(option.value)}
                                            >
                                              <RadioGroupItem id={optionId} value={option.value} className="sr-only" />
                                              <Label htmlFor={optionId} className="cursor-pointer">
                                                <span className="block text-sm font-semibold text-gray-900">
                                                  {option.label}
                                                </span>
                                                <span className="mt-1 block text-xs text-gray-600">
                                                  {option.description}
                                                </span>
                                              </Label>
                                            </div>
                                          )
                                        })}
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
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
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium">Length (m)</FormLabel>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={20}
                                      step={0.1}
                                      value={(field.value / 1000).toFixed(1)}
                                      onChange={(e) => {
                                        const value = Number(e.target.value)
                                        if (value === 0 || isNaN(value)) {
                                          field.onChange(1000)
                                        } else {
                                          field.onChange(Math.max(1000, value * 1000))
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const value = Number(e.target.value)
                                        if (value === 0 || isNaN(value) || value < 1) {
                                          field.onChange(1000)
                                        }
                                      }}
                                      className="h-8 w-16 text-center text-sm"
                                    />
                                  </div>
                                  <FormControl>
                                    <Slider
                                      min={1000}
                                      max={20000}
                                      step={100}
                                      value={[field.value]}
                                      onValueChange={(vals) => field.onChange(vals[0])}
                                      className="py-2"
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
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium">Width (m)</FormLabel>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={20}
                                      step={0.1}
                                      value={(field.value / 1000).toFixed(1)}
                                      onChange={(e) => {
                                        const value = Number(e.target.value)
                                        if (value === 0 || isNaN(value)) {
                                          field.onChange(1000)
                                        } else {
                                          field.onChange(Math.max(1000, value * 1000))
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const value = Number(e.target.value)
                                        if (value === 0 || isNaN(value) || value < 1) {
                                          field.onChange(1000)
                                        }
                                      }}
                                      className="h-8 w-16 text-center text-sm"
                                    />
                                  </div>
                                  <FormControl>
                                    <Slider
                                      min={1000}
                                      max={20000}
                                      step={100}
                                      value={[field.value]}
                                      onValueChange={(vals) => field.onChange(vals[0])}
                                      className="py-2"
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
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium">Eave Height (m)</FormLabel>
                                    <Input
                                      type="number"
                                      min={2.4}
                                      max={5}
                                      step={0.1}
                                      value={(field.value / 1000).toFixed(1)}
                                      onChange={(e) => {
                                        const value = Number(e.target.value)
                                        if (value === 0 || isNaN(value)) {
                                          field.onChange(2400)
                                        } else {
                                          field.onChange(Math.max(2400, value * 1000))
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const value = Number(e.target.value)
                                        if (value === 0 || isNaN(value) || value < 2.4) {
                                          field.onChange(2400)
                                        }
                                      }}
                                      className="h-8 w-16 text-center text-sm"
                                    />
                                  </div>
                                  <FormControl>
                                    <Slider
                                      min={2400}
                                      max={5000}
                                      step={100}
                                      value={[field.value]}
                                      onValueChange={(vals) => field.onChange(vals[0])}
                                      className="py-2"
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
                                              className="mr-2 h-4 w-4 rounded border border-gray-300"
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
                                              className="mr-2 h-4 w-4 rounded border border-gray-300"
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

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">3D Preview Controls</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-gray-600">
                            <p>• Rotate with left click or touch drag</p>
                            <p>• Zoom with mouse wheel or pinch</p>
                            <p>• Pan with right click or two-finger drag</p>
                          </CardContent>
                        </Card>

                        <Button
                          type="button"
                          onClick={proceedToCustomerDetails}
                          className="flex w-full items-center justify-center gap-2 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                          Continue to Customer Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Customer Details</CardTitle>
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
                                      placeholder="Enter customer's full name"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                      className="text-sm"
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
                                      placeholder="name@example.com"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                      className="text-sm"
                                    />
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
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
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
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
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
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                      className="min-h-[100px] text-sm"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button type="button" onClick={backToDesign} variant="outline" className="w-full sm:flex-1">
                            Back to Design
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:flex-1 bg-green-600 text-white hover:bg-green-700"
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

            {isMobile && (
              <div className="border-t border-gray-100 px-5 py-4 text-center text-xs text-gray-500">
                Created by <span className="font-semibold text-blue-600">Gazi OGUTCU</span> 2025
              </div>
            )}
          </div>
        </div>
      </div>

      {!isMobile && (
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          aria-expanded={!isSidebarCollapsed}
          aria-controls="design-sidebar"
          className="fixed top-32 z-50 hidden h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:flex"
          style={{ left: `${toggleButtonLeft}px` }}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" aria-hidden /> : <ChevronLeft className="h-5 w-5" aria-hidden />}
          <span className="sr-only">
            {isSidebarCollapsed ? "Expand design controls" : "Collapse design controls"}
          </span>
        </button>
      )}

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
  )
}
