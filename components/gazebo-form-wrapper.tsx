"use client"

import { Suspense } from "react"
import GazeboInquiryForm from "./gazebo-inquiry-form"

// Loading component for the form
function FormLoading() {
  return (
    <div className="min-h-screen relative">
      {/* Loading Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading 3D Designer...</p>
          </div>
        </div>
      </div>

      {/* Loading Sidebar */}
      <div className="fixed left-0 top-0 z-10 w-96 h-screen bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-gray-200/50">
          <h1 className="text-2xl font-bold text-gray-900">Aussie Patio Designer</h1>
          <p className="text-sm text-gray-600">Preparing design interface...</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading components...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GazeboFormWrapper() {
  return (
    <Suspense fallback={<FormLoading />}>
      <GazeboInquiryForm />
    </Suspense>
  )
}
