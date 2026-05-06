// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

const SITE_URL = "https://patiodesigner.com.au";
const OG_IMAGE = "/og-patio-designer.jpg";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Patio Designer",
  alternateName: "Aussie Patio Designer",
  url: SITE_URL,
  description:
    "Design and visualise Australian patios and gazebos in 3D with Colorbond-style colours, roof profiles and quote-ready dimensions.",
  inLanguage: "en-AU",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Patio Designer | Aussie Patio & Gazebo Configurator",
    template: "%s | Patio Designer",
  },
  description:
    "Design and visualise your patio or gazebo in 3D. Choose Colorbond colours, roof types (gable, skillion, hip), sizes and options, then share or export your design. Built for Australia.",
  keywords: [
    "patio designer",
    "gazebo configurator",
    "Colorbond",
    "patio builder",
    "patio design Australia",
    "patio ideas Australia",
    "gable roof",
    "skillion roof",
    "3D configurator",
    "Queensland",
    "Australia",
  ],
  applicationName: "Patio Designer",
  authors: [{ name: "Patio Designer Team" }],
  generator: "Next.js",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Patio Designer",
    title: "Design Your Patio in 3D | Patio Designer",
    description:
      "Fast, accurate 3D patio and gazebo planning with Colorbond-style colours, roof profiles and real dimensions.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "3D Patio Designer",
      },
    ],
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Your Patio in 3D",
    description:
      "Plan your patio or gazebo with Colorbond-style palettes, roof styles and exact sizes.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8KSVRMVSDX"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8KSVRMVSDX', { send_page_view: true });
          `}
        </Script>

        {/* Structured Data */}
        <Script id="ld-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(websiteJsonLd)}
        </Script>
        <Script id="ld-org" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Patio Designer",
            alternateName: "Aussie Patio Designer",
            url: SITE_URL,
            logo: `${SITE_URL}/apple-touch-icon.png`,
          })}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
