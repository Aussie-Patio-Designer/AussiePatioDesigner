import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Palette,
  Ruler,
  ShieldCheck,
  SunMedium,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const SITE_URL = "https://patioDesigner.com.au"
const ARTICLE_PATH = "/blog/best-patio-design-ideas-australia"
const ARTICLE_URL = `${SITE_URL}${ARTICLE_PATH}`
const HERO_IMAGE = "/images/blog/best-patio-design-ideas-australia.svg"
const PUBLISHED_DATE = "2026-05-06"
const UPDATED_DATE = "2026-05-06"

export const metadata: Metadata = {
  title: "Best Patio Design Ideas Australia (2026 Guide)",
  description:
    "Discover the best patio design ideas for Australian homes, including roof styles, Colorbond colours, sizing, shade, drainage and quote-ready planning tips.",
  keywords: [
    "best patio design ideas Australia",
    "patio design Australia",
    "Australian patio ideas",
    "Colorbond patio colours",
    "patio roof design",
    "outdoor living Australia",
  ],
  alternates: {
    canonical: ARTICLE_PATH,
  },
  openGraph: {
    type: "article",
    title: "Best Patio Design Ideas Australia: A Practical 2026 Guide",
    description:
      "Plan a cooler, more useful patio with roof style, sizing, Colorbond colour and quote preparation tips for Australian homes.",
    url: ARTICLE_URL,
    publishedTime: PUBLISHED_DATE,
    modifiedTime: UPDATED_DATE,
    images: [
      {
        url: HERO_IMAGE,
        width: 1600,
        height: 900,
        alt: "AI-generated illustration of a modern Australian patio with a Colorbond-style roof, timber deck and outdoor dining area",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Patio Design Ideas Australia (2026 Guide)",
    description:
      "Roof profiles, colours, sizing and planning tips for a better Australian patio design.",
    images: [HERO_IMAGE],
  },
}

const designIdeas = [
  {
    title: "Start with orientation and shade",
    description:
      "Map the hottest afternoon sun, common wind direction and where rain tends to enter the outdoor area. This helps you choose the right roof projection, post placement and privacy screening before you focus on finishes.",
    icon: SunMedium,
  },
  {
    title: "Choose a roof profile that suits your home",
    description:
      "Gable patios can add height and airflow, skillion roofs suit clean modern lines, and hip-inspired designs can feel integrated with existing roof forms. The best option is the one that balances appearance, runoff and usable head height.",
    icon: Ruler,
  },
  {
    title: "Use Colorbond-style colours as a full palette",
    description:
      "Think beyond the roof sheet. Match or deliberately contrast gutters, fascia, beams and posts so the patio looks planned from every angle, including from inside the house.",
    icon: Palette,
  },
]

const quoteChecklist = [
  "Overall length, width and preferred height",
  "Roof type, cladding profile and approximate pitch",
  "Preferred roof, beam, post and trim colours",
  "Site address, access notes and photos of the attachment area",
  "Drainage concerns, privacy needs and any existing structures nearby",
]

const faqs = [
  {
    question: "What is the best patio roof style for Australian homes?",
    answer:
      "There is no single best patio roof style for every Australian home. Gable roofs are popular when homeowners want extra height and airflow, while skillion roofs suit modern homes and straightforward rain runoff. The best choice depends on your home, block, budget and local requirements.",
  },
  {
    question: "Which patio colours are best for resale appeal?",
    answer:
      "Neutral exterior colours usually have the broadest appeal because they work with more brick, render, roof and landscape palettes. A 3D preview can help compare lighter and darker Colorbond-style combinations before you request a quote.",
  },
  {
    question: "How can I make a patio quote more accurate?",
    answer:
      "Provide clear dimensions, site photos, preferred roof type, colour choices, access notes and any concerns about drainage or sun exposure. The clearer the design brief, the easier it is for a builder or installer to price the work.",
  },
]

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Best Patio Design Ideas Australia: A Practical 2026 Guide",
  description: metadata.description,
  image: `${SITE_URL}${HERO_IMAGE}`,
  datePublished: PUBLISHED_DATE,
  dateModified: UPDATED_DATE,
  author: {
    "@type": "Organization",
    name: "Patio Designer",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "Patio Designer",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/apple-touch-icon.png`,
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": ARTICLE_URL,
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function BestPatioDesignIdeasAustraliaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            <ArrowRight className="mr-2 size-4 rotate-180" />
            Back to blog
          </Link>

          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Patio Design Guide
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Best patio design ideas for Australian homes in 2026
            </h1>
            <p className="max-w-3xl text-xl leading-9 text-slate-600">
              The best patio designs are comfortable in hot weather, practical
              during rain, visually connected to the home and simple for a builder
              to quote. Use this guide to plan a stronger design brief before you
              start comparing patio options.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span>Published May 6, 2026</span>
              <span aria-hidden="true">•</span>
              <span>8 min read</span>
              <span aria-hidden="true">•</span>
              <span>Updated for Australian outdoor living projects</span>
            </div>
          </div>

          <figure className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10">
            <Image
              src={HERO_IMAGE}
              alt="AI-generated illustration of a modern Australian patio with a Colorbond-style roof, timber deck and outdoor dining area"
              width={1600}
              height={900}
              priority
              className="aspect-video w-full object-cover"
            />
            <figcaption className="border-t border-emerald-50 px-5 py-3 text-sm text-slate-500">
              AI-generated concept image showing a modern covered patio with a
              Colorbond-style roof, outdoor dining area and open backyard setting.
            </figcaption>
          </figure>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {designIdeas.map((idea) => {
            const Icon = idea.icon

            return (
              <Card key={idea.title} className="border-emerald-100 bg-white/90 shadow-lg shadow-emerald-950/5">
                <CardContent className="space-y-4 p-6">
                  <Icon className="size-7 text-emerald-700" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-slate-950">{idea.title}</h2>
                  <p className="leading-7 text-slate-600">{idea.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <div className="space-y-5 [&_h2]:scroll-mt-20 [&_h2]:pt-3 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:text-lg [&_p]:leading-8 [&_p]:text-slate-600">
          <h2>1. Design for shade before you design for size</h2>
          <p>
            Many homeowners start by asking how big the patio should be. Size matters,
            but comfort usually starts with shade. A slightly smaller patio that blocks
            the harshest sun can feel more useful than a larger area that overheats in
            the afternoon. Think about where you will sit, where the barbecue will go
            and what parts of the house need protection from glare.
          </p>
          <p>
            If the patio will sit beside living or dining rooms, test the view from
            inside as well. A roof that looks balanced externally can still feel too low
            from a kitchen window. This is where a 3D patio designer is useful: you can
            adjust the width, length, height and roof type before committing to a quote.
          </p>

          <h2>2. Match the roof profile to your architecture</h2>
          <p>
            A gable patio often suits homeowners who want an open feeling, visible roof
            detail and improved vertical space. A skillion patio can suit contemporary
            homes, narrow side areas and clean-lined extensions. Hip-inspired patio
            forms can look settled and traditional when the existing house already uses
            similar roof geometry.
          </p>
          <p>
            The key SEO phrase is simple, but the practical decision is nuanced: the
            best patio design ideas in Australia are not just about appearance. They
            also need to handle rainwater, allow safe access, respect boundaries and
            connect neatly to the existing building.
          </p>

          <h2>3. Choose a colour palette, not just a roof colour</h2>
          <p>
            Colorbond-style colour selection should include the full structure. The
            roof sheet, posts, beams, gutters and trims can either blend into the home
            or create a deliberate feature. Lighter colours can visually soften a large
            patio roof, while deeper colours can frame a modern outdoor room.
          </p>
          <p>
            For resale-friendly patio design, start with colours already visible on the
            home: roof, fascia, window frames, brick, render, paving and landscaping.
            Then create two or three combinations and preview them before deciding.
          </p>

          <h2>4. Plan furniture zones early</h2>
          <p>
            A patio should be designed around how people move through it. Allow space
            for chairs to pull out from the table, a walkway from the back door and a
            practical cooking or serving area if you entertain outdoors. If the patio is
            too narrow, it can look good in a drawing but feel cramped in everyday use.
          </p>
          <p>
            A simple starting point is to decide whether the patio is mainly for dining,
            lounging, outdoor cooking, shade over doors and windows, or a mix of all of
            these. That choice will guide the best length, width and post layout.
          </p>

          <h2>5. Prepare a quote-ready design brief</h2>
          <p>
            Search traffic is helpful, but the real goal is a patio design that can move
            from inspiration to action. Before contacting an installer or builder, write
            down the practical details that influence pricing and construction.
          </p>
        </div>

        <Card className="border-emerald-100 bg-white shadow-xl shadow-emerald-950/5">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex rounded-full bg-emerald-50 p-3 text-emerald-700">
                  <ClipboardCheck className="size-6" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Quote-ready patio checklist
                </h2>
                <p className="leading-7 text-slate-600">
                  Save time by preparing these details before you request pricing or
                  submit an enquiry through the patio designer.
                </p>
              </div>
              <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                <Link href="/">
                  Build your 3D patio brief
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {quoteChecklist.map((item) => (
                <li key={item} className="flex gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 size-5 flex-none text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-7 text-emerald-700" aria-hidden="true" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Frequently asked questions
            </h2>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border-emerald-100 bg-white/90">
                <CardContent className="space-y-3 p-6">
                  <h3 className="text-xl font-bold text-slate-950">{faq.question}</h3>
                  <p className="leading-7 text-slate-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
