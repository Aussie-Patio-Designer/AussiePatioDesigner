import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CheckCircle2, Palette, Ruler, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Aussie Patio Designer | Design your patio in 3D",
  description:
    "Create a clear patio or gazebo concept with roof styles, real dimensions and Colorbond-style colours, then use it as a quote-ready brief.",
  alternates: { canonical: "/" },
}

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
}

const roofCards = [
  {
    title: "The Classic Gable",
    label: "GABLE ROOF",
    pitch: "15°-25°",
    span: "8m",
    description:
      "Create a feeling of space and light with a high-pitched traditional roofline.",
  },
  {
    title: "Modern Skillion",
    label: "SKILLION ROOF",
    pitch: "2°-10°",
    span: "6m",
    description:
      "A sleek, single-slope design that complements contemporary Australian architecture.",
  },
]

export default function Home() {
  return (
    <main className="bg-[#fdf9ee] text-[#1c1c15]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd) }} />

      <section className="relative min-h-[78vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#273136]/90 via-[#273136]/60 to-transparent" />
        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Free Australian patio design tool</p>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Design your patio in 3D before requesting a quote</h1>
            <p className="mb-10 text-lg text-white/90">Create a clear patio or gazebo concept with roof styles, real dimensions and Colorbond-style colours, then use it as a quote-ready brief.</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                <Link href="/design">Start Designing <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white">
                <Link href="/blog">Read Patio Guides</Link>
              </Button>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-3 text-sm uppercase tracking-wide text-white/80 sm:grid-cols-2">
              {[
                "Gable and skillion styles",
                "Colorbond-style colors",
                "Fast brief for installers",
                "No app download required",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-amber-300" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4e8] py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Architectural Options</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-[#273136]">Choose Your Structural Foundation</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {roofCards.map((card) => (
              <Card key={card.title} className="border-[#273136]/10 bg-white">
                <CardContent className="p-8">
                  <p className="mb-4 inline-block bg-[#273136] px-3 py-1 text-xs font-semibold text-white">{card.label}</p>
                  <h3 className="text-2xl font-bold text-[#273136]">{card.title}</h3>
                  <p className="mt-3 text-slate-600">{card.description}</p>
                  <div className="mt-6 flex gap-6 border-t border-[#273136]/10 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Pitch: {card.pitch}</span>
                    <span>Max Span: {card.span}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Precision Planning</p>
          <h2 className="mt-2 text-3xl font-bold text-[#273136]">3D Patio Concept In Minutes</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card><CardContent className="p-8"><Sparkles className="mb-4 size-8 text-emerald-700" /><h3 className="text-2xl font-bold">Better Visual Quality</h3></CardContent></Card>
            <Card className="bg-[#273136] text-white"><CardContent className="p-8"><Ruler className="mb-4 size-8 text-amber-300" /><h3 className="text-2xl font-bold">Real Dimensions</h3></CardContent></Card>
            <Card><CardContent className="p-8"><Palette className="mb-4 size-8 text-emerald-700" /><h3 className="text-2xl font-bold">Colorbond Palettes</h3></CardContent></Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#273136] p-12 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Interactive Designer</p>
          <h2 className="mt-4 text-4xl font-extrabold">Build your quote-ready patio concept</h2>
          <p className="mx-auto mt-4 max-w-3xl text-white/80">Configure roof style, dimensions, Colorbond-style colours and project details in one place.</p>
          <Button asChild size="lg" className="mt-8 bg-emerald-700 hover:bg-emerald-800"><Link href="/design">Load 3D Designer</Link></Button>
        </div>
      </section>
    </main>
  )
}
