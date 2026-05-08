import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Palette,
  Ruler,
  ShieldCheck,
  SunMedium,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { absoluteUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: "Patio Design Blog Australia",
  description:
    "Australian patio design blog with roof style guides, Colorbond colour ideas, sizing advice and quote-ready outdoor living planning tips.",
  keywords: [
    "patio design blog Australia",
    "Australian patio ideas",
    "Colorbond patio colours",
    "patio roof styles",
    "outdoor living planning",
  ],
  alternates: {
    canonical: "/blog",
  },
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

const featuredPost = {
  title: "Best patio design ideas for Australian homes in 2026",
  excerpt:
    "Plan a cooler, more practical outdoor area with roof profile, Colorbond-style colour, sizing, shade and quote preparation tips for Australian homes.",
  category: "SEO Guide",
  date: "May 6, 2026",
  readTime: "8 min read",
  href: "/blog/best-patio-design-ideas-australia",
  image: "/images/blog/best-patio-design-ideas-australia.svg",
  imageAlt:
    "AI-generated illustration of a modern Australian patio with a Colorbond-style roof and outdoor dining area",
  icon: SunMedium,
}

const posts = [
  {
    title: "Colorbond patio colours Australia: best combinations for 2026",
    excerpt:
      "Choose roof, post, beam, gutter and deck colours that feel connected to your home and comfortable in Australian sunlight.",
    category: "Colour Selection",
    date: "May 6, 2026",
    readTime: "7 min read",
    href: "/blog/colorbond-patio-colours-australia",
    icon: Palette,
  },
  {
    title: "Gable, hip or skillion: choosing the right patio roof profile",
    excerpt:
      "Compare common roof styles by airflow, height, visual impact and how each option can tie into an existing home.",
    category: "Roof Styles",
    date: "May 2, 2026",
    readTime: "5 min read",
    icon: Ruler,
  },
  {
    title: "Colorbond patio colour ideas for modern Australian homes",
    excerpt:
      "Learn how to balance roof, posts, guttering and surrounding landscape tones for a cohesive outdoor area.",
    category: "Colour Selection",
    date: "April 24, 2026",
    readTime: "4 min read",
    icon: CheckCircle2,
  },
]

const planningTips = [
  "Measure the full available area, including setbacks from boundaries and services.",
  "Think about afternoon sun, prevailing rain and the view from inside your home.",
  "Use a 3D patio preview to test sizes, roof profiles and Colorbond colours before you enquire.",
]

export default function BlogPage() {
  const FeaturedIcon = featuredPost.icon

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogItemListJsonLd) }}
      />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-emerald-100 bg-white/85 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="max-w-3xl space-y-5">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              <ArrowRight className="mr-2 size-4 rotate-180" />
              Back to patio designer
            </Link>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                Aussie Patio Designer Blog
              </p>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Patio planning advice for better outdoor living
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Browse practical guides for choosing roof styles, Colorbond colours,
                dimensions and design details before you submit your patio or gazebo enquiry.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Link href="/">
              Start designing
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
            <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.75fr_1fr] lg:p-10">
              <Link
                href={featuredPost.href}
                className="relative block min-h-64 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500"
              >
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.imageAlt}
                  width={1600}
                  height={900}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute right-5 top-5 rounded-full bg-white/20 p-4 text-white backdrop-blur">
                  <FeaturedIcon className="size-8" aria-hidden="true" />
                </div>
              </Link>
              <article className="flex flex-col justify-center gap-5">
                <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-100">
                  <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                    Featured
                  </span>
                  <span>{featuredPost.category}</span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {featuredPost.date}
                  </span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg leading-8 text-slate-200">{featuredPost.excerpt}</p>
                </div>
                <Button asChild variant="secondary" className="w-fit">
                  <Link href={featuredPost.href}>
                    Read the first article
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </article>
            </CardContent>
          </Card>

          <aside className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
              Quick checklist
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              Before you choose a patio design
            </h2>
            <ul className="mt-6 space-y-4">
              {planningTips.map((tip) => (
                <li key={tip} className="flex gap-3 text-slate-700">
                  <CheckCircle2
                    className="mt-0.5 size-5 flex-none text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                Latest articles
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Design guides and project tips
              </h2>
            </div>
            <p className="max-w-xl text-slate-600">
              Fresh ideas to help homeowners, builders and sales teams create clearer patio briefs.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => {
              const Icon = post.icon

              return (
                <Card
                  key={post.title}
                  className="group border-emerald-100 bg-white/90 shadow-lg shadow-emerald-950/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
                >
                  <CardContent className="flex h-full flex-col gap-5 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        {post.category}
                      </span>
                      <Icon className="size-6 text-emerald-700" aria-hidden="true" />
                    </div>
                    <div className="space-y-3">
                      {"href" in post ? (
                        <h3 className="text-xl font-bold leading-tight text-slate-950">
                          <Link
                            href={post.href}
                            className="transition hover:text-emerald-700"
                          >
                            {post.title}
                          </Link>
                        </h3>
                      ) : (
                        <h3 className="text-xl font-bold leading-tight text-slate-950">
                          {post.title}
                        </h3>
                      )}
                      <p className="leading-7 text-slate-600">{post.excerpt}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                    {"href" in post ? (
                      <Link
                        href={post.href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                      >
                        Read article
                        <ArrowRight className="size-4" />
                      </Link>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </section>
    </main>
  )
}
