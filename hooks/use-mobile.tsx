"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if running on client side
    if (typeof window === "undefined") return

    // Function to update state based on window size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Set initial value
    checkIsMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}
