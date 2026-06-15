import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  Palette,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Aussie Patio Designer | Free 3D Patio Design Tool for Australian Homes",
  description:
    "Design your patio in 3D before spending a dollar. Choose roof styles, real Colorbond® colours and dimensions, then export a quote-ready brief for any installer.",
  alternates: { canonical: "/" },
}

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
}

const trustItems = [
  "No sign-up required",
  "Gable & Skillion roofs",
  "Real Colorbond® colours",
  "Instant quote brief",
]

const stats = [
  { value: "5,000+", label: "Designs Created" },
  { value: "2", label: "Roof Styles" },
  { value: "100%", label: "Free Tool" },
]

const testimonials = [
  {
    quote:
      "Finally a tool that let me show the builder exactly what I wanted. Saved hours of back-and-forth.",
    name: "Sarah T.",
    location: "Brisbane QLD",
  },
  {
    quote:
      "I tested 6 different Colorbond colour combos in minutes. Ended up with exactly the right finish.",
    name: "Michael R.",
    location: "Perth WA",
  },
  {
    quote:
      "The 3D brief I exported made my quote request instant. The installer knew exactly what to price.",
    name: "Jen K.",
    location: "Melbourne VIC",
  },
]

const steps = [
  {
    num: "01",
    icon: Sparkles,
    title: "Configure Your Design",
    description:
      "Choose roof style (gable or skillion), set width, depth, height and post positions in real time.",
  },
  {
    num: "02",
    icon: Palette,
    title: "Pick Your Colours",
    description:
      "Apply Colorbond®-style palettes to roof, beams, posts and gutters to see the full effect.",
  },
  {
    num: "03",
    icon: FileText,
    title: "Download Your Brief",
    description:
      "Export a structured summary with dimensions, style and colour choices to share with any installer.",
  },
]

const roofCards = [
  {
    dark: true,
    label: "GABLE ROOF",
    title: "The Classic Gable",
    pitch: "15°–25°",
    span: "8m",
    description:
      "Add height, improve airflow and create a feeling of open space with a symmetrical high-pitched roofline. Suits most Australian home styles.",
  },
  {
    dark: false,
    label: "SKILLION ROOF",
    title: "Modern Skillion",
    pitch: "2°–10°",
    span: "6m",
    description:
      "A clean single-slope design that runs water off quickly and suits contemporary and coastal architecture.",
  },
]

const features = [
  {
    icon: Eye,
    title: "3D Visual Preview",
    description: "See your patio from any angle before speaking to a builder.",
  },
  {
    icon: Palette,
    title: "Real Colorbond® Colours",
    description: "Choose from the full Australian Colorbond® palette for every surface.",
  },
  {
    icon: Ruler,
    title: "Accurate Dimensions",
    description: "Set real millimetre dimensions and see them reflected live.",
  },
  {
    icon: FileText,
    title: "Quote-Ready Export",
    description: "Download a structured brief your installer can price straight away.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "No registration, no waiting. Your design loads in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Works on Any Device",
    description: "Desktop, tablet or phone — design anywhere in Australia.",
  },
]

const blogPreviews = [
  {
    title: "Best Patio Design Ideas for Australian Homes in 2026",
    href: "/blog/best-patio-design-ideas-australia",
    category: "Design Guide",
    readTime: "8 min read",
  },
  {
    title: "Colorbond Patio Colours Australia: Best Combinations for 2026",
    href: "/blog/colorbond-patio-colours-australia",
    category: "Colour Selection",
    readTime: "7 min read",
  },
]

export default function Home() {
  return (
    <main className="bg-[#fdf9ee] text-[#1c1c15]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd) }}
      />

      {/* HERO */}
      <section className="relative bg-[#273136] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#273136] via-[#273136]/95 to-emerald-950/40 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 mb-8">
              🏆 Australia&apos;s Free 3D Patio Designer
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
              Design Your Perfect Patio{" "}
              <span className="text-amber-300">Before You Spend a Dollar</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
              Thousands of Australian homeowners use our free 3D designer to visualise roof
              styles, Colorbond® colours and real dimensions — then send a polished brief to
              installers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                asChild
                size="lg"
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-base px-8 py-6 h-auto font-bold shadow-lg shadow-emerald-900/40"
              >
                <Link href="/design">
                  Start Designing Free
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white text-base px-8 py-6 h-auto"
              >
                <Link href="/blog">Read Planning Guides</Link>
              </Button>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="size-4 text-amber-300 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-white/10 pt-8 grid grid-cols-3 gap-8 max-w-lg">
            {stats.map((s, i) => (
              <div key={s.label} className={`text-center ${i < stats.length - 1 ? "border-r border-white/10" : ""}`}>
                <div className="text-3xl font-extrabold text-amber-300">{s.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-[#f7f4e8] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-3">
            What Australians Are Saying
          </p>
          <h2 className="text-center text-3xl font-bold text-[#273136] mb-12">
            Trusted by Australian Homeowners &amp; Patio Installers
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-white border border-[#273136]/8 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-bold text-[#273136] text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-3">
            Simple Process
          </p>
          <h2 className="text-4xl font-bold text-[#273136] mb-4">
            From Idea to Quote-Ready Brief in 3 Steps
          </h2>
          <p className="text-lg text-slate-500 mb-14 max-w-2xl">
            No account needed. No complex software. Just a fast, clear path from concept to
            installer-ready brief.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.num} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#273136] flex items-center justify-center">
                      <Icon className="size-6 text-amber-300" />
                    </div>
                    <span className="text-5xl font-black text-[#273136]/8 leading-none select-none">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#273136] mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-14">
            <Button
              asChild
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 text-base px-8 py-6 h-auto font-bold"
            >
              <Link href="/design">
                Try the 3D Designer Free
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ROOF STYLES */}
      <section className="py-24 bg-[#f7f4e8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-3">
            Architectural Options
          </p>
          <h2 className="text-4xl font-bold text-[#273136] mb-14">
            Two Proven Roof Profiles
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {roofCards.map((card) => (
              <Card
                key={card.title}
                className={`overflow-hidden border-0 shadow-xl ${
                  card.dark ? "bg-[#273136] text-white" : "bg-white text-[#273136]"
                }`}
              >
                <CardContent className="p-10">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6 ${
                      card.dark
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-[#273136] text-white"
                    }`}
                  >
                    {card.label}
                  </span>
                  <h3 className="text-3xl font-extrabold mb-4">{card.title}</h3>
                  <p className={`leading-relaxed mb-8 ${card.dark ? "text-white/70" : "text-slate-500"}`}>
                    {card.description}
                  </p>
                  <div
                    className={`flex gap-8 border-t pt-6 mb-8 text-xs font-bold uppercase tracking-widest ${
                      card.dark ? "border-white/10 text-white/50" : "border-[#273136]/10 text-slate-400"
                    }`}
                  >
                    <span>Pitch: {card.pitch}</span>
                    <span>Max Span: {card.span}</span>
                  </div>
                  <Link
                    href="/design"
                    className={`inline-flex items-center gap-2 text-sm font-bold transition ${
                      card.dark
                        ? "text-amber-300 hover:text-amber-200"
                        : "text-emerald-700 hover:text-emerald-900"
                    }`}
                  >
                    Design This Roof <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-3">
            What&apos;s Inside the Tool
          </p>
          <h2 className="text-4xl font-bold text-[#273136] mb-14">
            Everything You Need to Design with Confidence
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <Card key={f.title} className="border border-slate-100 bg-slate-50/60 shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-700/10 flex items-center justify-center mb-5">
                      <Icon className="size-6 text-emerald-700" />
                    </div>
                    <h3 className="text-lg font-bold text-[#273136] mb-2">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">{f.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="py-24 bg-[#273136]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300 mb-3">
            Patio Planning Guides
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <h2 className="text-4xl font-bold text-white">Learn Before You Build</h2>
            <p className="text-white/60 max-w-sm text-sm leading-relaxed">
              Our guides cover roof selection, colour strategy, sizing and how to get a sharper quote.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 mb-10">
            {blogPreviews.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group block rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-300/80 bg-amber-400/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-white/40">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-amber-200 transition-colors">
                  {post.title}
                </h3>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  Read guide <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white text-base px-8 py-6 h-auto"
            >
              <Link href="/blog">Browse All Guides</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 text-base px-8 py-6 h-auto font-bold"
            >
              <Link href="/design">
                Start Designing Free <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-extrabold text-white mb-5 tracking-tight">
            Your Dream Patio Is 3 Minutes Away
          </h2>
          <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of Australians who designed their patio before getting a quote.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-emerald-800 hover:bg-white/90 text-base px-10 py-7 h-auto font-extrabold shadow-2xl shadow-emerald-950/30"
          >
            <Link href="/design">
              Start Designing Free
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
