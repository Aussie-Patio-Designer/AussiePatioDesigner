import type { MetadataRoute } from "next"

import { absoluteUrl, SITE_UPDATED_AT } from "@/lib/site"

const routes = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
  {
    path: "/blog/best-patio-design-ideas-australia",
    priority: 0.85,
    changeFrequency: "monthly",
  },
  {
    path: "/blog/colorbond-patio-colours-australia",
    priority: 0.85,
    changeFrequency: "monthly",
  },
  { path: "/withhouse", priority: 0.75, changeFrequency: "monthly" },
  { path: "/engineering", priority: 0.65, changeFrequency: "monthly" },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: SITE_UPDATED_AT,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
