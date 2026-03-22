import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/sales-agents/", "/api/"],
      },
    ],
    sitemap: "https://salezo.io/sitemap.xml",
  };
}
