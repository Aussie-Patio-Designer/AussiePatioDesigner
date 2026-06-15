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
  Sparkles,
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
    accentColor: "from-violet-500 to-purple-600",
  },
  {
    title: "Gable, Hip or Skillion: Choosing the Right Patio Roof Profile",
    excerpt:
      "Compare roof styles by airflow, height, visual impact and how each option can tie into your existing home.",
    category: "Roof Styles",
    date: "Coming Soon",
    readTime: "5 min read",
    icon: Ruler,
    accentColor: "from-amber-500 to-orange-600",
  },
  {
    title: "How to Prepare a Quote-Ready Patio Brief",
    excerpt:
      "What to include in your patio design brief so installers can give you accurate, comparable quotes first time.",
    category: "Planning",
    date: "Coming Soon",
    readTime: "4 min read",
    icon: FileText,
    accentColor: "from-emerald-500 to-teal-600",
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
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(5px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-up        { animation: fadeInUp 0.7s ease both; }
        .animate-fade-up-d1     { animation: fadeInUp 0.7s 0.1s ease both; }
        .animate-fade-up-d2     { animation: fadeInUp 0.7s 0.2s ease both; }
        .animate-fade-up-d3     { animation: fadeInUp 0.7s 0.3s ease both; }
        .animate-fade-up-d4     { animation: fadeInUp 0.7s 0.4s ease both; }
        .animate-fade-left      { animation: fadeInLeft 0.6s ease both; }
        .animate-float          { animation: float 3s ease-in-out infinite; }
        .animate-arrow-bounce   { animation: arrowBounce 1.2s ease-in-out infinite; }
        .animate-pulse-ring     { animation: pulseRing 2s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #fbbf24 0%, #fff 40%, #fbbf24 60%, #f59e0b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .gradient-animated {
          background: linear-gradient(270deg, #059669, #0d9488, #0369a1, #059669);
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite;
        }
        .card-hover {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        .icon-spin:hover svg {
          transition: transform 0.4s ease;
          transform: rotate(15deg) scale(1.15);
        }
        .read-link:hover .arrow-icon {
          animation: arrowBounce 0.6s ease-in-out infinite;
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogItemListJsonLd) }}
      />

      {/* HERO */}
      <section className="bg-[#273136] overflow-hidden relative">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 40%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-amber-300 transition-all duration-300 mb-10 group animate-fade-left"
          >
            <ArrowRight className="size-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Patio Designer
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300 mb-5 animate-fade-up">
            Aussie Patio Designer Blog
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6 max-w-3xl animate-fade-up-d1">
            Design Smarter.{" "}
            <span className="shimmer-text">Build Better.</span>
          </h1>
          <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-2xl animate-fade-up-d2">
            Expert patio planning guides written for Australian homeowners. Choose the right
            roof, colours and dimensions before you ever call a builder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-14 animate-fade-up-d3">
            <Button
              asChild
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 text-base px-8 py-6 h-auto font-bold animate-pulse-ring transition-all duration-300 hover:scale-105"
            >
              <Link href="/design">
                Start Designing Your Patio
                <ArrowRight className="size-5 arrow-icon" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-10 animate-fade-up-d4">
            {heroStats.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-3 group cursor-default ${i < heroStats.length - 1 ? "pr-10 border-r border-white/10" : ""}`}
                >
                  <Icon className="size-5 text-amber-300/70 group-hover:text-amber-300 group-hover:scale-110 transition-all duration-300" />
                  <div>
                    <div className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors duration-300">{s.value}</div>
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
        <section className="animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="size-4 text-emerald-600 animate-float" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
              Featured Article
            </p>
          </div>
          <div className="card-hover rounded-3xl overflow-hidden">
            <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl shadow-slate-950/20 rounded-3xl">
              <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.65fr_1fr] lg:p-10">
                <Link
                  href="/blog/best-patio-design-ideas-australia"
                  className="relative block min-h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-700 group"
                >
                  <Image
                    src="/images/blog/best-patio-design-ideas-australia.svg"
                    alt="Modern Australian patio with Colorbond-style roof and outdoor dining area"
                    width={1600}
                    height={900}
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute top-4 left-4 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                    Featured
                  </span>
                  <span className="absolute bottom-4 right-4 rounded-full bg-emerald-600/90 backdrop-blur px-3 py-1 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    Read Now →
                  </span>
                </Link>
                <article className="flex flex-col justify-center gap-5 py-2">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-300 animate-pulse">
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
                    className="w-fit bg-white/10 hover:bg-white/20 text-white border-0 transition-all duration-300 hover:scale-105 read-link group"
                  >
                    <Link href="/blog/best-patio-design-ideas-australia">
                      Read Full Guide
                      <ArrowRight className="size-4 arrow-icon group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </article>
              </CardContent>
            </Card>
          </div>
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
              {articles.map((post, idx) => {
                const Icon = post.icon
                return (
                  <div
                    key={post.title}
                    className="card-hover"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <Card className="border border-slate-100 bg-white shadow-sm overflow-hidden group">
                      <div className={`h-1 w-full bg-gradient-to-r ${post.accentColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                      <CardContent className="p-6 flex gap-5">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${post.accentColor} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 icon-spin`}>
                          <Icon className="size-5 text-white" />
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
                                className="hover:text-emerald-700 transition-colors duration-200"
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
                              className="read-link inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors duration-200 group/link"
                            >
                              Read article
                              <ArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-400 italic">
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              Coming soon
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <Card className="border border-emerald-100 bg-white shadow-sm card-hover">
              <CardContent className="p-7">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 mb-3">
                  Quick Checklist
                </p>
                <h3 className="text-xl font-bold text-[#273136] mb-5">
                  Before You Choose a Design
                </h3>
                <ul className="space-y-4">
                  {planningChecklist.map((tip, i) => (
                    <li
                      key={tip}
                      className="flex gap-3 text-sm text-slate-600 leading-snug group cursor-default"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <CheckCircle2 className="mt-0.5 size-4 flex-none text-emerald-600 group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-200" />
                      <span className="group-hover:text-slate-800 transition-colors duration-200">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="card-hover rounded-2xl overflow-hidden">
              <Card className="border-0 text-white shadow-xl overflow-hidden">
                <div className="gradient-animated p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 mb-3">
                    Free Design Tool
                  </p>
                  <h3 className="text-xl font-bold mb-3">Try the Free 3D Patio Designer</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    Visualise your roof style, Colorbond® colours and real dimensions before
                    requesting any quote.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-white text-emerald-800 hover:bg-white/90 font-bold transition-all duration-300 hover:scale-105 group"
                  >
                    <Link href="/design">
                      Start Designing Free
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </aside>
        </section>

        {/* PLANNING TIPS */}
        <section className="rounded-3xl bg-[#f7f4e8] p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
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
                { label: "Roof Styles", detail: "Gable & Skillion", color: "bg-emerald-50 border-emerald-100" },
                { label: "Colour Palettes", detail: "Full Colorbond® range", color: "bg-amber-50 border-amber-100" },
                { label: "Dimensions", detail: "Real mm accuracy", color: "bg-sky-50 border-sky-100" },
                { label: "Quote Brief", detail: "Export-ready PDF", color: "bg-violet-50 border-violet-100" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} rounded-2xl p-5 border shadow-sm card-hover cursor-default`}
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
      <section className="gradient-animated py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 0%, transparent 50%), radial-gradient(circle at 70% 50%, white 0%, transparent 50%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
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
            className="bg-white text-emerald-800 hover:bg-white/90 text-base px-10 py-7 h-auto font-extrabold shadow-2xl transition-all duration-300 hover:scale-105 animate-pulse-ring group"
          >
            <Link href="/design">
              Start Designing Free
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
