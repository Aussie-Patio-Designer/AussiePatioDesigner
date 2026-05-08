import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CheckCircle2, Gauge, Palette, Ruler, Sparkles } from "lucide-react"

import LazyGazeboDesigner from "@/components/lazy-gazebo-designer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Free 3D Patio Designer Australia",
  description:
    "Design a patio or gazebo online in 3D with Australian roof profiles, Colorbond-style colours, real dimensions and quote-ready project details.",
  keywords: [
    "free patio designer Australia",
    "3D patio designer",
    "patio design tool",
    "gazebo designer",
    "Colorbond patio colours",
    "patio quote Australia",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Free 3D Patio Designer Australia",
    description:
      "Plan roof type, Colorbond-style colours, size and layout before requesting a patio quote.",
    url: SITE_URL,
    images: [
      {
        url: "/og-patio-designer.jpg",
        width: 1200,
        height: 630,
        alt: "3D patio designer for Australian outdoor living projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free 3D Patio Designer Australia",
    description:
      "Create a 3D patio concept with roof styles, dimensions and Colorbond-style colours.",
    images: ["/og-patio-designer.jpg"],
  },
}

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  description:
    "Australian 3D patio and gazebo design tool for planning roof styles, Colorbond-style colours, dimensions and quote-ready project details.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AUD",
  },
  areaServed: {
    "@type": "Country",
    name: "Australia",
  },
}

const benefits = [
  {
    title: "Better visual quality",
    description:
      "Preview roof shape, posts, colours and proportions before you speak with an installer.",
    icon: Sparkles,
  },
  {
    title: "Real dimensions",
    description:
      "Plan length, width, height and roof pitch so your enquiry is easier to price.",
    icon: Ruler,
  },
  {
    title: "Colorbond-style palettes",
    description:
      "Test roof, post and beam colour combinations for Australian outdoor living.",
    icon: Palette,
  },
  {
    title: "Faster page load",
    description:
      "The landing page is lightweight, and the interactive 3D designer loads only when needed.",
    icon: Gauge,
  },
]

const SITE_URL = "https://patioDesigner.com.au"

export const metadata: Metadata = {
  title: "Free 3D Patio Designer Australia",
  description:
    "Design a patio or gazebo online in 3D with Australian roof profiles, Colorbond-style colours, real dimensions and quote-ready project details.",
  keywords: [
    "free patio designer Australia",
    "3D patio designer",
    "patio design tool",
    "gazebo designer",
    "Colorbond patio colours",
    "patio quote Australia",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Free 3D Patio Designer Australia",
    description:
      "Plan roof type, Colorbond-style colours, size and layout before requesting a patio quote.",
    url: SITE_URL,
    images: [
      {
        url: "/og-patio-designer.jpg",
        width: 1200,
        height: 630,
        alt: "3D patio designer for Australian outdoor living projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free 3D Patio Designer Australia",
    description:
      "Create a 3D patio concept with roof styles, dimensions and Colorbond-style colours.",
    images: ["/og-patio-designer.jpg"],
  },
}

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Patio Designer",
  url: SITE_URL,
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  description:
    "Australian 3D patio and gazebo design tool for planning roof styles, Colorbond-style colours, dimensions and quote-ready project details.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AUD",
  },
  areaServed: {
    "@type": "Country",
    name: "Australia",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd) }}
      />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="grid gap-8 rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="flex flex-col justify-center gap-6">
            <div className="space-y-4">
              <p className="inline-flex w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Free Australian patio design tool
              </p>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Design your patio in 3D before requesting a quote
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Create a clear patio or gazebo concept with roof styles, real dimensions and Colorbond-style colours, then use it as a quote-ready brief.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                <a href="#designer">
                  Start designing
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/blog">
                  Read patio guides
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {[
                "Gable and skillion-style roof planning",
                "Colorbond-style roof and frame colours",
                "Fast design brief for installers",
                "No app download required",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500 p-6 text-white shadow-xl shadow-emerald-950/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.35),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.1),rgba(15,23,42,0.45))]" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-50">
                  Premium preview
                </p>
                <h2 className="text-3xl font-bold">3D patio concept in minutes</h2>
                <p className="max-w-md leading-7 text-emerald-50">
                  The full 3D editor is lazy-loaded for speed, while this page gives visitors and search engines helpful content immediately.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {benefits.slice(0, 2).map((benefit) => {
                  const Icon = benefit.icon

                  return (
                    <div key={benefit.title} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <Icon className="mb-3 size-6" aria-hidden="true" />
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-emerald-50">{benefit.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon

            return (
              <Card key={benefit.title} className="border-emerald-100 bg-white/90 shadow-lg shadow-emerald-950/5">
                <CardContent className="space-y-4 p-6">
                  <Icon className="size-7 text-emerald-700" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-slate-950">{benefit.title}</h2>
                  <p className="leading-7 text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <LazyGazeboDesigner />
      </section>
    </main>
  )
}
