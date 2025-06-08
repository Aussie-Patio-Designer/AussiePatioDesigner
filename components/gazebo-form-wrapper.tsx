"use client"

import { useEffect, useState } from "react"
import GazeboInquiryForm from "./gazebo-inquiry-form"

export function GazeboFormWrapper() {
  const [agentData, setAgentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we're on an agent page by looking for the AGENT_DATA script
    if (typeof window !== "undefined" && window.AGENT_DATA) {
      console.log("📋 Found agent data:", window.AGENT_DATA)
      setAgentData(window.AGENT_DATA)
    } else {
      console.log("ℹ️ No agent data found, using default form")
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <GazeboInquiryForm agentData={agentData} />
}

// Add both named and default exports
export default GazeboFormWrapper
