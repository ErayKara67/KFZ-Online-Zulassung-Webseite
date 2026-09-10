import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/bestellung", "/haendler", "/auftrag"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
