import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Palette,
  Ruler,
  Star,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { absoluteUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: "Patio Design Blog Australia | Planning Guides for Homeowners",
  description:
    "Expert patio planning guides for Australian homeowners. Choose the right roof style, Colorbond® colours and dimensions before you call a builder.",
  keywords: [
    "patio design blog Australia",
    "Australian patio ideas",
    "Colorbond patio colours",
    "patio roof styles",
    "outdoor living planning",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Patio Design Blog Australia",
    description:
      "Practical Australian guides for planning, designing and visualising patios and gazebos.",
    url: "/blog",
  },
}

const blogPosts = [
  {
    title: "Best patio design ideas for Australian homes in 2026",
    href: "/blog/best-patio-design-ideas-australia",
    description:
      "Plan a cooler, more practical outdoor area with roof profile, Colorbond-style colour, sizing, shade and quote preparation tips.",
  },
  {
    title: "Colorbond patio colours Australia: best combinations for 2026",
    href: "/blog/colorbond-patio-colours-australia",
    description:
      "Choose roof, post, beam, gutter and deck colours that feel connected to your home and comfortable in Australian sunlight.",
  },
]

const blogItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Patio Designer Blog Articles",
  itemListElement: blogPosts.map((post, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(post.href),
    name: post.title,
    description: post.description,
  })),
}

const heroStats = [
  { icon: FileText, value: "2", label: "Expert Guides" },
  { icon: Users, value: "1,000+", label: "Monthly Readers" },
  { icon: Star, value: "100%", label: "Free to Read" },
]

const articles = [
  {
    title: "Colorbond Patio Colours Australia: Best Combinations for 2026",
    excerpt:
      "Choose roof, post, beam, gutter and deck colours that feel connected to your home and comfortable in Australian sunlight.",
    category: "Colour Selection",
    date: "May 6, 2026",
    readTime: "7 min read",
    href: "/blog/colorbond-patio-colours-australia",
    icon: Palette,
  },
  {
    title: "Gable, Hip or Skillion: Choosing the Right Patio Roof Profile",
    excerpt:
      "Compare roof styles by airflow, height, visual impact and how each option can tie into your existing home.",
    category: "Roof Styles",
    date: "Coming Soon",
    readTime: "5 min read",
    icon: Ruler,
  },
  {
    title: "How to Prepare a Quote-Ready Patio Brief",
    excerpt:
      "What to include in your patio design brief so installers can give you accurate, comparable quotes first time.",
    category: "Planning",
    date: "Coming Soon",
    readTime: "4 min read",
    icon: FileText,
  },
]

const planningChecklist = [
  "Measure the available area, including boundary setbacks",
  "Consider afternoon sun, prevailing rain and views from inside",
  "Use a 3D preview to test roof styles and Colorbond® colours",
  "Prepare a brief with dimensions, colours and site details",
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#fdf9ee] text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogItemListJsonLd) }}
      />

      {/* HERO */}
      <section className="bg-[#273136] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-amber-300 transition-colors mb-10"
          >
            <ArrowRight className="size-4 rotate-180" />
            Back to Patio Designer
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300 mb-5">
            Aussie Patio Designer Blog
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6 max-w-3xl">
            Design Smarter.{" "}
            <span className="text-amber-300">Build Better.</span>
          </h1>
          <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-2xl">
            Expert patio planning guides written for Australian homeowners. Choose the right
            roof, colours and dimensions before you ever call a builder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Button
              asChild
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 text-base px-8 py-6 h-auto font-bold"
            >
              <Link href="/design">
                Start Designing Your Patio
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-10">
            {heroStats.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-3 ${i < heroStats.length - 1 ? "pr-10 border-r border-white/10" : ""}`}
                >
                  <Icon className="size-5 text-amber-300/70" />
                  <div>
                    <div className="text-xl font-extrabold text-white">{s.value}</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest">{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* FEATURED ARTICLE */}
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-6">
            Featured Article
          </p>
          <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
            <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.65fr_1fr] lg:p-10">
              <Link
                href="/blog/best-patio-design-ideas-australia"
                className="relative block min-h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-700"
              >
                <Image
                  src="/images/blog/best-patio-design-ideas-australia.svg"
                  alt="Modern Australian patio with Colorbond-style roof and outdoor dining area"
                  width={1600}
                  height={900}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Featured
                </span>
              </Link>
              <article className="flex flex-col justify-center gap-5 py-2">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-300">
                    SEO Guide
                  </span>
                  <span className="flex items-center gap-1.5 text-white/50">
                    <CalendarDays className="size-4" />
                    May 6, 2026
                  </span>
                  <span className="text-white/50">8 min read</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-balance">
                    Best Patio Design Ideas for Australian Homes in 2026
                  </h2>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Plan a cooler, more useful patio with roof style, sizing, Colorbond® colour
                    and quote preparation tips for Australian homes.
                  </p>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  className="w-fit bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <Link href="/blog/best-patio-design-ideas-australia">
                    Read Full Guide
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </article>
            </CardContent>
          </Card>
        </section>

        {/* ARTICLE GRID + SIDEBAR */}
        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-3">
              Latest Articles
            </p>
            <h2 className="text-3xl font-bold text-[#273136] mb-8">
              All Patio Planning Guides
            </h2>
            <div className="grid gap-5">
              {articles.map((post) => {
                const Icon = post.icon
                return (
                  <Card
                    key={post.title}
                    className="group border border-slate-100 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-6 flex gap-5">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Icon className="size-5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {post.category}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {post.date}
                          </span>
                          <span className="text-xs text-slate-400">{post.readTime}</span>
                        </div>
                        {"href" in post && post.href ? (
                          <h3 className="text-lg font-bold text-[#273136] mb-2 leading-snug">
                            <Link
                              href={post.href}
                              className="hover:text-emerald-700 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                        ) : (
                          <h3 className="text-lg font-bold text-[#273136] mb-2 leading-snug">
                            {post.title}
                          </h3>
                        )}
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                        {"href" in post && post.href ? (
                          <Link
                            href={post.href}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                          >
                            Read article <ArrowRight className="size-4" />
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Coming soon</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <Card className="border border-emerald-100 bg-white shadow-sm">
              <CardContent className="p-7">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 mb-3">
                  Quick Checklist
                </p>
                <h3 className="text-xl font-bold text-[#273136] mb-5">
                  Before You Choose a Design
                </h3>
                <ul className="space-y-4">
                  {planningChecklist.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm text-slate-600 leading-snug">
                      <CheckCircle2 className="mt-0.5 size-4 flex-none text-emerald-600" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-[#273136] text-white shadow-xl shadow-[#273136]/20">
              <CardContent className="p-7">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300 mb-3">
                  Free Design Tool
                </p>
                <h3 className="text-xl font-bold mb-3">Try the Free 3D Patio Designer</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Visualise your roof style, Colorbond® colours and real dimensions before
                  requesting any quote.
                </p>
                <Button
                  asChild
                  className="w-full bg-emerald-700 hover:bg-emerald-600 font-bold"
                >
                  <Link href="/design">
                    Start Designing Free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>

        {/* PLANNING TIPS */}
        <section className="rounded-3xl bg-[#f7f4e8] p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-3">
                Before You Start
              </p>
              <h2 className="text-3xl font-bold text-[#273136] mb-4">
                Smart planning saves time and money
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Knowing your roof style, preferred colours and exact dimensions before you
                contact an installer means sharper quotes, less back-and-forth and a finished
                patio that looks exactly as you imagined.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Roof Styles", detail: "Gable & Skillion" },
                { label: "Colour Palettes", detail: "Full Colorbond® range" },
                { label: "Dimensions", detail: "Real mm accuracy" },
                { label: "Quote Brief", detail: "Export-ready PDF" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl p-5 border border-white shadow-sm"
                >
                  <div className="text-sm font-bold text-[#273136]">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Ready to Design Your Patio?
          </h2>
          <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
            Use our free 3D tool to visualise your roof style, colours and dimensions before
            requesting a quote.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-emerald-800 hover:bg-white/90 text-base px-10 py-7 h-auto font-extrabold shadow-2xl"
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
