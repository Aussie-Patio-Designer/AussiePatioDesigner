import type { Metadata } from "next"
import GazeboFormWrapper from "@/components/gazebo-form-wrapper"

export const metadata: Metadata = {
  title: "3D Patio Designer Australia | Plan Colorbond Patio Designs",
  description:
    "Design an Australian patio or gazebo online in 3D. Compare roof profiles, Colorbond-style colours, dimensions and quote-ready options before you enquire.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "3D Patio Designer Australia",
    description:
      "Plan patio and gazebo designs with roof profiles, Colorbond-style palettes and real dimensions.",
    url: "/",
    images: [
      {
        url: "/og-patio-designer.jpg",
        width: 1200,
        height: 630,
        alt: "3D patio designer interface for Australian outdoor living projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Patio Designer Australia",
    description:
      "Design your patio or gazebo online with Australian roof and colour options.",
    images: ["/og-patio-designer.jpg"],
  },
}

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-stretch px-4 py-6 sm:px-6 lg:px-12 xl:px-24">
      <GazeboFormWrapper />
    </main>
  )
}
