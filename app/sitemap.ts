import type { MetadataRoute } from "next";
import { fetchUpcomingIPOs } from "@/lib/finnhub";

export const revalidate = 14400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let ipos: { symbol: string }[] = [];
  try {
    ipos = await fetchUpcomingIPOs();
  } catch {}

  const ipoRoutes = ipos.map((ipo) => ({
    url: `${baseUrl}/ipo/${ipo.symbol}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...ipoRoutes,
  ];
}
