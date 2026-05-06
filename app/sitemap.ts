import type { MetadataRoute } from "next";

const SITE_URL = "https://patiodesigner.com.au";
const lastModified = new Date("2026-05-06");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/blog/best-patio-design-ideas-australia`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/engineering`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
  ];
}
