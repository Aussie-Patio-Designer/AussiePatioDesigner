import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/withhouse", "/engineering"],
        disallow: [
          "/admin",
          "/api",
          "/agent-debug",
          "/debug",
          "/debug-agents",
          "/debug-lockyer-email",
          "/debug-lockyer-routing",
          "/email-debug",
          "/status",
          "/test",
          "/test-agent-creation",
          "/test-agent-routing",
          "/test-email-routing",
          "/test-lockyer-routing",
          "/test-roof-profiles",
          "/track-lockyer",
          "/verify-db",
          "/view-data",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
