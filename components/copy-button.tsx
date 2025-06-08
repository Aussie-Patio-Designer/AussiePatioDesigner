"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

export function CopyButton({ text, className, variant = "outline", size = "sm", children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleCopy} className={cn("flex items-center gap-2", className)}>
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {children || "Copied!"}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {children || "Copy"}
        </>
      )}
    </Button>
  )
}
