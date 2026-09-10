import type { MetadataRoute } from "next";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/zulassungsstellen",
    "/ratgeber",
    "/fuer-autohaeuser",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/widerruf",
    "/barrierefreiheit",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
    ...services.map((s) => ({
      url: `${site.url}/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
