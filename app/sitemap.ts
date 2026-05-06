import type { MetadataRoute } from "next"

const SITE_URL = "https://patioDesigner.com.au"
const UPDATED_AT = new Date("2026-05-06T00:00:00.000Z")

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
    url: `${SITE_URL}${route.path}`,
    lastModified: UPDATED_AT,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
