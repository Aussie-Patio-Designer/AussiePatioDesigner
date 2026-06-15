"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Box, Loader2 } from "lucide-react"

import { ClientErrorBoundary } from "@/components/client-error-boundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function DesignerErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Card className="border-red-100 bg-white shadow-xl shadow-red-950/5">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-700">
          <Box className="size-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-950">The designer could not load safely</h2>
          <p className="max-w-xl text-slate-600">
            Your design details form is still available, but this browser stopped the interactive designer from loading.
          </p>
          <p className="max-w-xl text-xs text-slate-500">{error.message}</p>
        </div>
        <Button type="button" variant="outline" onClick={onRetry}>
          Try loading again
        </Button>
      </CardContent>
    </Card>
  )
}

function DesignerLoadingState() {
  return (
    <Card className="border-emerald-100 bg-white shadow-xl shadow-emerald-950/5">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="rounded-full bg-emerald-50 p-4 text-emerald-700">
          <Loader2 className="size-8 animate-spin" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-950">Loading the 3D patio designer</h2>
          <p className="max-w-xl text-slate-600">
            We load the interactive 3D tools only when you need them so the page opens faster.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const GazeboFormWrapper = dynamic(() => import("@/components/gazebo-form-wrapper"), {
  ssr: false,
  loading: DesignerLoadingState,
})

export default function LazyGazeboDesigner({ autoLoad = false }: { autoLoad?: boolean }) {
  const [shouldLoadDesigner, setShouldLoadDesigner] = useState(autoLoad)
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current

    if (autoLoad || !section || shouldLoadDesigner) {
      return
    }

    if (!("IntersectionObserver" in window)) {
      setShouldLoadDesigner(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadDesigner(true)
          observer.disconnect()
        }
      },
      { rootMargin: "500px 0px" },
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [autoLoad, shouldLoadDesigner])

  return (
    <section id="designer" ref={sectionRef} className="scroll-mt-8 space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-950/5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Interactive designer
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Build your quote-ready patio concept
          </h2>
          <p className="max-w-2xl text-slate-600">
            Configure roof style, dimensions, Colorbond-style colours and project details in one streamlined workspace.
          </p>
        </div>
        {!shouldLoadDesigner && (
          <Button
            type="button"
            size="lg"
            className="bg-emerald-700 hover:bg-emerald-800"
            onClick={() => setShouldLoadDesigner(true)}
          >
            Load 3D designer
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {shouldLoadDesigner ? (
        <ClientErrorBoundary
          fallback={(error, reset) => <DesignerErrorState error={error} onRetry={reset} />}
          onError={(error, errorInfo) => {
            console.error("3D designer failed to render", error, errorInfo)
          }}
        >
          <GazeboFormWrapper />
        </ClientErrorBoundary>
      ) : (
        <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white shadow-2xl shadow-slate-950/20">
          <CardContent className="grid min-h-[420px] gap-8 p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
            <div className="flex items-center justify-center rounded-3xl bg-white/10 p-8 backdrop-blur">
              <Box className="size-28 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="flex flex-col justify-center gap-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">
                Faster first load
              </p>
              <h3 className="text-balance text-3xl font-bold sm:text-4xl">
                The heavy 3D scene loads after you start designing.
              </h3>
              <p className="max-w-2xl text-lg leading-8 text-slate-200">
                This keeps the landing page quick for visitors and search engines while preserving the full interactive design experience.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-fit"
                onClick={() => setShouldLoadDesigner(true)}
              >
                Start the 3D designer
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
