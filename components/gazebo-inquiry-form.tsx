"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

interface FormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  siteAddress: string
  additionalDetails: string
  roofType: string
  roofCladding: string
  roofPitch: string
  length: number
  width: number
  height: number
  hasOverhang: boolean
  overhangSides: string
  overhangSize: number
  roofColor: string
  postBeamColor: string
}

const GazeboInquiryForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()
  const [screenshot, setScreenshot] = useState<string | null>(null)

  useEffect(() => {
    // Get agent ID from URL if present
    const urlParams = new URLSearchParams(window.location.search)
    const agentId = urlParams.get("agent")

    if (agentId) {
      console.log("🏢 Agent detected:", agentId)
      // You can fetch and display agent info here if needed
    }
  }, [])

  const onSubmit = async (data: FormData) => {
    const urlParams = new URLSearchParams(window.location.search)
    const agentId = urlParams.get("agent")

    const submissionData = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      siteAddress: data.siteAddress,
      additionalDetails: data.additionalDetails,
      roofType: data.roofType,
      roofCladding: data.roofCladding,
      roofPitch: data.roofPitch,
      length: data.length,
      width: data.width,
      height: data.height,
      hasOverhang: data.hasOverhang,
      overhangSides: data.overhangSides,
      overhangSize: data.overhangSize,
      roofColor: data.roofColor,
      postBeamColor: data.postBeamColor,
      screenshot: screenshot,
      agentId: agentId, // Add this line
    }

    console.log("Form Data:", submissionData)

    // Here you would typically send the data to your backend
    // Example:
    // try {
    //   const response = await fetch('/api/submit-form', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(submissionData),
    //   });
    //   if (response.ok) {
    //     alert('Form submitted successfully!');
    //   } else {
    //     alert('Form submission failed.');
    //   }
    // } catch (error) {
    //   console.error('Error submitting form:', error);
    //   alert('An error occurred while submitting the form.');
    // }
  }

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-4">
      <div className="mb-4">
        <label htmlFor="customerName" className="block text-gray-700 text-sm font-bold mb-2">
          Customer Name:
        </label>
        <input
          type="text"
          id="customerName"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("customerName", { required: "Customer name is required" })}
        />
        {errors.customerName && <p className="text-red-500 text-xs italic">{errors.customerName.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="customerEmail" className="block text-gray-700 text-sm font-bold mb-2">
          Customer Email:
        </label>
        <input
          type="email"
          id="customerEmail"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("customerEmail", { required: "Customer email is required" })}
        />
        {errors.customerEmail && <p className="text-red-500 text-xs italic">{errors.customerEmail.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="customerPhone" className="block text-gray-700 text-sm font-bold mb-2">
          Customer Phone:
        </label>
        <input
          type="tel"
          id="customerPhone"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("customerPhone", { required: "Customer phone is required" })}
        />
        {errors.customerPhone && <p className="text-red-500 text-xs italic">{errors.customerPhone.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="siteAddress" className="block text-gray-700 text-sm font-bold mb-2">
          Site Address:
        </label>
        <input
          type="text"
          id="siteAddress"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("siteAddress", { required: "Site address is required" })}
        />
        {errors.siteAddress && <p className="text-red-500 text-xs italic">{errors.siteAddress.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="additionalDetails" className="block text-gray-700 text-sm font-bold mb-2">
          Additional Details:
        </label>
        <textarea
          id="additionalDetails"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("additionalDetails")}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="roofType" className="block text-gray-700 text-sm font-bold mb-2">
          Roof Type:
        </label>
        <input
          type="text"
          id="roofType"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("roofType", { required: "Roof type is required" })}
        />
        {errors.roofType && <p className="text-red-500 text-xs italic">{errors.roofType.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="roofCladding" className="block text-gray-700 text-sm font-bold mb-2">
          Roof Cladding:
        </label>
        <input
          type="text"
          id="roofCladding"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("roofCladding", { required: "Roof cladding is required" })}
        />
        {errors.roofCladding && <p className="text-red-500 text-xs italic">{errors.roofCladding.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="roofPitch" className="block text-gray-700 text-sm font-bold mb-2">
          Roof Pitch:
        </label>
        <input
          type="text"
          id="roofPitch"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("roofPitch", { required: "Roof pitch is required" })}
        />
        {errors.roofPitch && <p className="text-red-500 text-xs italic">{errors.roofPitch.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="length" className="block text-gray-700 text-sm font-bold mb-2">
          Length (meters):
        </label>
        <input
          type="number"
          id="length"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("length", { required: "Length is required", valueAsNumber: true })}
        />
        {errors.length && <p className="text-red-500 text-xs italic">{errors.length.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="width" className="block text-gray-700 text-sm font-bold mb-2">
          Width (meters):
        </label>
        <input
          type="number"
          id="width"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("width", { required: "Width is required", valueAsNumber: true })}
        />
        {errors.width && <p className="text-red-500 text-xs italic">{errors.width.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="height" className="block text-gray-700 text-sm font-bold mb-2">
          Height (meters):
        </label>
        <input
          type="number"
          id="height"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("height", { required: "Height is required", valueAsNumber: true })}
        />
        {errors.height && <p className="text-red-500 text-xs italic">{errors.height.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="hasOverhang" className="block text-gray-700 text-sm font-bold mb-2">
          Has Overhang:
        </label>
        <input
          type="checkbox"
          id="hasOverhang"
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("hasOverhang")}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="overhangSides" className="block text-gray-700 text-sm font-bold mb-2">
          Overhang Sides:
        </label>
        <input
          type="text"
          id="overhangSides"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("overhangSides")}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="overhangSize" className="block text-gray-700 text-sm font-bold mb-2">
          Overhang Size (meters):
        </label>
        <input
          type="number"
          id="overhangSize"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("overhangSize", { valueAsNumber: true })}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="roofColor" className="block text-gray-700 text-sm font-bold mb-2">
          Roof Color:
        </label>
        <input
          type="text"
          id="roofColor"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("roofColor", { required: "Roof color is required" })}
        />
        {errors.roofColor && <p className="text-red-500 text-xs italic">{errors.roofColor.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="postBeamColor" className="block text-gray-700 text-sm font-bold mb-2">
          Post Beam Color:
        </label>
        <input
          type="text"
          id="postBeamColor"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("postBeamColor", { required: "Post beam color is required" })}
        />
        {errors.postBeamColor && <p className="text-red-500 text-xs italic">{errors.postBeamColor.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="screenshot" className="block text-gray-700 text-sm font-bold mb-2">
          Screenshot:
        </label>
        <input
          type="file"
          id="screenshot"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={handleScreenshotUpload}
        />
        {screenshot && <img src={screenshot || "/placeholder.svg"} alt="Screenshot" className="mt-2 max-h-40" />}
      </div>

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit
      </button>
    </form>
  )
}

export default GazeboInquiryForm
