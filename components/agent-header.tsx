"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"

interface AgentInfo {
  company_name: string
  contact_name: string
  email: string
  phone?: string | null
  website_url?: string | null
  logo_url?: string | null
}

interface AgentHeaderProps {
  agent: AgentInfo
}

const NAV_TAGLINE = "Professional Patio & Gazebo Design"

function AgentNavDetails({ agent, className }: { agent: AgentInfo; className?: string }) {
  const initials = useMemo(() => {
    return agent.company_name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase())
      .join("")
      .slice(0, 2)
  }, [agent.company_name])

  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {agent.logo_url ? (
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200">
            <Image
              src={agent.logo_url}
              alt={`${agent.company_name} logo`}
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
            {initials || agent.company_name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{agent.company_name}</h1>
          <p className="text-sm text-gray-600">{NAV_TAGLINE}</p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-6">
        {agent.website_url && (
          <Link
            href={agent.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            Visit Website →
          </Link>
        )}
        <div className="text-left md:text-right">
          <p className="text-sm font-medium text-gray-900">{agent.contact_name}</p>
          {agent.phone && (
            <p className="text-xs text-gray-600">{agent.phone}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AgentHeader({ agent }: AgentHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="hidden items-center justify-between gap-4 md:flex">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-semibold text-gray-900">Aussie Patio Designer</p>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Agent navigation</p>
              <p className="text-sm text-gray-600">Managing {agent.company_name}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              aria-controls="agent-navigation-details"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100"
            >
              {isExpanded ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-medium text-gray-900">{agent.contact_name}</p>
            {agent.phone && <p className="text-xs text-gray-600">{agent.phone}</p>}
          </div>
        </div>

        <div
          id="agent-navigation-details"
          className={cn(
            "hidden overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out md:block",
            isExpanded
              ? "pointer-events-auto mt-4 max-h-[20rem] opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <AgentNavDetails agent={agent} />
        </div>

        <div className="md:hidden">
          <AgentNavDetails agent={agent} className="py-1" />
        </div>
      </div>
    </header>
  )
}

export default AgentHeader
