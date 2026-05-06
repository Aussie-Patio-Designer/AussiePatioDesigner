import type { MetadataRoute } from "next";

const SITE_URL = "https://patiodesigner.com.au";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/agent-debug",
        "/api/",
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
        "/withhouse",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
