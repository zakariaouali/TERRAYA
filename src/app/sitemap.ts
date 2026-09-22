import type { MetadataRoute } from "next";
import { getPropertySlugs } from "@/lib/properties";
import { insights } from "@/data/insights";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const propertySlugs = await getPropertySlugs();

  const staticPaths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/properties", priority: 0.9 },
    { path: "/investment", priority: 0.8 },
    { path: "/services", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/insights", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
    { path: "/legal/privacy", priority: 0.2 },
    { path: "/legal/terms", priority: 0.2 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = propertySlugs.map((slug) => ({
    url: `${base}/properties/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const insightRoutes: MetadataRoute.Sitemap = insights.map((i) => ({
    url: `${base}/insights/${i.slug}`,
    lastModified: new Date(i.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...insightRoutes];
}
