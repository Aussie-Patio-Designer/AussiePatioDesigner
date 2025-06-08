"use client"

import { Suspense } from "react"
import EmbedForm from "@/components/embed-form"

export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <EmbedForm />
      </Suspense>
    </div>
  )
}
