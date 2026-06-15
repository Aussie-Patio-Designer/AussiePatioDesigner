import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CheckCircle2, Compass, Palette, Ruler } from "lucide-react"

import LazyGazeboDesigner from "@/components/lazy-gazebo-designer"
import { Button } from "@/components/ui/button"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Patio Design Studio",
  description:
    "Build your patio or gazebo concept in our full 3D design studio with Australian roof profiles, dimensions and Colorbond-style colours.",
  alternates: {
    canonical: "/design",
  },
  openGraph: {
    title: "Patio Design Studio",
    description:
      "Use the full 3D patio designer to plan roof style, measurements and colours before requesting a quote.",
    url: `${SITE_URL}/design`,
  },
}

const highlights = [
  "Set roof profile, dimensions and structure details.",
  "Try Colorbond-style palettes for roof and framing.",
  "Generate a quote-ready concept before contacting installers.",
]

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-950/5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <Compass className="size-4" />
                3D Design Studio
              </p>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Design your patio concept in full detail
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                The 3D designer now opens automatically on this page. Build a patio or gazebo concept, test colours and dimensions, then submit a clearer quote brief.
              </p>
              <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  Back home
                  <ArrowRight className="size-4 rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                <Link href="/blog">
                  Read guidelines
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm text-slate-600">
            <Ruler className="size-4 text-emerald-700" /> Real measurements
            <Palette className="ml-4 size-4 text-emerald-700" /> Palette testing
          </div>
        </header>

        <LazyGazeboDesigner autoLoad />
      </section>
    </main>
  )
}
