import type { Metadata } from "next"

import GazeboFormWrapper from "@/components/gazebo-form-wrapper"

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
    <main className="flex min-h-screen w-full flex-col items-stretch px-4 py-6 sm:px-6 lg:px-12 xl:px-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd) }}
      />
      <GazeboFormWrapper />
    </main>
  )
}
