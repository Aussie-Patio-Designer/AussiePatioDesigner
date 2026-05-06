import type { MetadataRoute } from "next"

const SITE_URL = "https://patioDesigner.com.au"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/withhouse", "/engineering"],
        disallow: [
          "/admin",
          "/api",
          "/debug",
          "/debug-agents",
          "/debug-lockyer-email",
          "/debug-lockyer-routing",
          "/email-debug",
          "/test",
          "/test-agent-creation",
          "/test-agent-routing",
          "/test-email-routing",
          "/test-lockyer-routing",
          "/test-roof-profiles",
          "/verify-db",
          "/view-data",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
