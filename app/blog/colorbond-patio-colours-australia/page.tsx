import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Palette,
  Paintbrush,
  ShieldCheck,
  SunMedium,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site"

const ARTICLE_PATH = "/blog/colorbond-patio-colours-australia"
const ARTICLE_URL = absoluteUrl(ARTICLE_PATH)
const HERO_IMAGE = "/images/blog/colorbond-patio-colours-australia.svg"
const PUBLISHED_DATE = "2026-05-06"
const UPDATED_DATE = "2026-05-06"

export const metadata: Metadata = {
  title: "Colorbond Patio Colours Australia: Best Combinations for 2026",
  description:
    "Choose better Colorbond patio colours with practical Australian design tips for roof sheets, posts, beams, gutters, decking and home exterior palettes.",
  keywords: [
    "Colorbond patio colours",
    "patio colour ideas Australia",
    "Colorbond roof colours patio",
    "outdoor patio colour schemes",
    "Australian patio design",
    "patio roof colour combinations",
  ],
  alternates: {
    canonical: ARTICLE_PATH,
  },
  openGraph: {
    type: "article",
    title: "Colorbond Patio Colours Australia: Best Combinations for 2026",
    description:
      "Practical colour palette advice for Australian patios, including roof sheets, posts, gutters, trims and decking combinations.",
    url: ARTICLE_URL,
    publishedTime: PUBLISHED_DATE,
    modifiedTime: UPDATED_DATE,
    images: [
      {
        url: HERO_IMAGE,
        width: 1600,
        height: 900,
        alt: "AI-generated illustration of an Australian patio with Colorbond-style colour swatches and a neutral outdoor palette",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colorbond Patio Colours Australia: Best Combinations for 2026",
    description:
      "How to choose patio roof, post, beam and trim colours that suit Australian homes.",
    images: [HERO_IMAGE],
  },
}

const colourPrinciples = [
  {
    title: "Start with the existing roof",
    description:
      "Your patio roof is usually seen beside the home roof, gutter and fascia. Matching or gently complementing those colours is the safest way to make the patio feel original to the house.",
    icon: Home,
  },
  {
    title: "Use contrast carefully",
    description:
      "Dark posts can frame a modern outdoor room, while lighter posts can make a large patio feel less heavy. The best contrast is intentional rather than accidental.",
    icon: Paintbrush,
  },
  {
    title: "Consider heat and glare",
    description:
      "Colour choices affect how a patio feels in bright Australian conditions. Lighter tones can reduce visual weight and glare, while deeper tones can create a stronger architectural edge.",
    icon: SunMedium,
  },
]

const paletteExamples = [
  "Charcoal roof with matching posts for a crisp modern patio",
  "Warm grey roof with off-white beams for a softer coastal look",
  "Deep green-grey roofing with timber decking and garden planting",
  "Light neutral roof with darker guttering to suit brick and render homes",
]

const faqs = [
  {
    question: "Should my patio roof colour match my house roof?",
    answer:
      "Matching the house roof is often the safest option, but it is not the only option. A complementary patio roof colour can work well when it also relates to gutters, fascia, window frames, paving or landscaping.",
  },
  {
    question: "Are dark Colorbond-style patio colours too hot?",
    answer:
      "Dark colours can feel visually heavier and may absorb more heat than lighter colours, but the roof profile, airflow, insulation options, shade direction and surrounding materials also affect comfort. Preview both light and dark combinations before deciding.",
  },
  {
    question: "What is the most resale-friendly patio colour scheme?",
    answer:
      "Neutral, coordinated palettes usually have the broadest resale appeal. Choose colours that look connected to the home rather than trendy in isolation.",
  },
]

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Colorbond Patio Colours Australia: Best Combinations for 2026",
  description: metadata.description,
  image: absoluteUrl(HERO_IMAGE),
  datePublished: PUBLISHED_DATE,
  dateModified: UPDATED_DATE,
  author: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
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

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: SITE_NAME,
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}/blog`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Colorbond Patio Colours Australia",
      item: ARTICLE_URL,
    },
  ],
}

const relatedArticle = {
  title: "Best patio design ideas for Australian homes in 2026",
  href: "/blog/best-patio-design-ideas-australia",
  description:
    "Plan roof profile, shade, sizing and quote-ready details before comparing colour palettes.",
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

export default function ColorbondPatioColoursAustraliaPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
              Colour Selection Guide
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Colorbond patio colours Australia: best combinations for 2026
            </h1>
            <p className="max-w-3xl text-xl leading-9 text-slate-600">
              A strong patio colour scheme connects the roof, posts, beams, gutters,
              deck, paving and garden into one outdoor room. Use this guide to choose
              a Colorbond-style palette that looks natural beside your home and still
              performs well in Australian sunlight.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span>Published May 6, 2026</span>
              <span aria-hidden="true">•</span>
              <span>7 min read</span>
              <span aria-hidden="true">•</span>
              <span>Australian patio colour planning</span>
            </div>
          </div>

          <figure className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10">
            <Image
              src={HERO_IMAGE}
              alt="AI-generated illustration of an Australian patio with Colorbond-style colour swatches and a neutral outdoor palette"
              width={1600}
              height={900}
              priority
              className="aspect-video w-full object-cover"
            />
            <figcaption className="border-t border-emerald-50 px-5 py-3 text-sm text-slate-500">
              AI-generated vector concept showing how roof, post, trim and deck
              colours can work together in a modern Australian patio palette.
            </figcaption>
          </figure>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {colourPrinciples.map((principle) => {
            const Icon = principle.icon

            return (
              <Card key={principle.title} className="border-emerald-100 bg-white/90 shadow-lg shadow-emerald-950/5">
                <CardContent className="space-y-4 p-6">
                  <Icon className="size-7 text-emerald-700" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-slate-950">
                    {principle.title}
                  </h2>
                  <p className="leading-7 text-slate-600">{principle.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <div className="space-y-5 [&_h2]:scroll-mt-20 [&_h2]:pt-3 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:text-lg [&_p]:leading-8 [&_p]:text-slate-600">
          <h2>1. Choose colours from the whole home, not a swatch alone</h2>
          <p>
            Patio colour decisions are easier when you look at the existing home as a
            complete palette. Roof sheets, fascia, gutters, downpipes, window frames,
            brick, render, deck boards, pavers and landscaping all influence whether a
            new patio feels integrated or added on later.
          </p>
          <p>
            If your home already has strong charcoal, monument-style or woodland-style
            tones, a matching patio roof can feel sharp and intentional. If the home is
            lighter, a soft grey or warm neutral may reduce the visual weight of the roof.
          </p>

          <h2>2. Decide what should blend in and what should stand out</h2>
          <p>
            A patio has several colour zones: roof, beams, posts, gutters, trims and
            sometimes screens. Not every element needs to be the same colour. A common
            approach is to make the roof and guttering relate to the house roof, then
            use posts and beams to either frame the outdoor space or quietly disappear.
          </p>
          <p>
            For modern homes, darker posts can create a strong architectural outline.
            For smaller patios or low rooflines, lighter posts can make the structure
            feel less bulky from inside the house.
          </p>

          <h2>3. Test light and dark palettes in 3D before requesting a quote</h2>
          <p>
            Colour can change dramatically between a sample, a browser screen and full
            outdoor sunlight. A 3D patio preview helps compare roof and post colours at
            the same time as size, pitch and roof profile, which makes your enquiry more
            useful for installers and builders.
          </p>
          <p>
            The goal is not to pick the trendiest colour. The goal is to choose a scheme
            that makes the patio feel connected to your house and comfortable for the way
            you use the outdoor area.
          </p>

          <h2>4. Use proven palette combinations as a starting point</h2>
          <p>
            The best Colorbond patio colour combinations usually repeat an existing
            exterior tone, add one clear contrast and leave enough neutral space for
            furniture, plants and paving to breathe.
          </p>
        </div>

        <Card className="border-emerald-100 bg-white shadow-xl shadow-emerald-950/5">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex rounded-full bg-emerald-50 p-3 text-emerald-700">
                  <Palette className="size-6" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Palette ideas to preview
                </h2>
                <p className="leading-7 text-slate-600">
                  Use these combinations as a starting point, then test your preferred
                  roof, post and beam colours in the 3D patio designer.
                </p>
              </div>
              <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                <Link href="/">
                  Preview patio colours
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {paletteExamples.map((item) => (
                <li key={item} className="flex gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 size-5 flex-none text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/80 shadow-lg shadow-emerald-950/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                Related guide
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                {relatedArticle.title}
              </h2>
              <p className="leading-7 text-slate-600">
                {relatedArticle.description}
              </p>
            </div>
            <Button asChild variant="outline" className="bg-white">
              <Link href={relatedArticle.href}>
                Read design guide
                <ArrowRight className="size-4" />
              </Link>
            </Button>
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
