import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeTabsClient } from "@/components/HomeTabsClient";
import { fetchUpcomingIPOs } from "@/lib/finnhub";
import { fetchNasdaqIPOs, fetchRecentIPOs } from "@/lib/nasdaq";
import { fetchStockQuote } from "@/lib/finnhub";
import { fetchNewsCount, fetchNewsForCompany } from "@/lib/news";
import { scoreIPOs, isTechSector } from "@/lib/scoring";
import { SPECULATIVE_IPOS } from "@/lib/speculation";
import type { IPO, NewsItem } from "@/lib/types";

export const metadata: Metadata = {
  title: `Upcoming IPO Calendar ${new Date().getFullYear()} — Discover New Public Offerings`,
  description:
    "Track upcoming IPOs ranked by hype score. Real-time news, price ranges, and sector filters for retail investors.",
};

export const revalidate = 3600;

async function getData(): Promise<{ upcoming: IPO[]; filed: IPO[] }> {
  const today = new Date().toISOString().split("T")[0];

  const [nasdaqResult, finnhubResult] = await Promise.allSettled([
    fetchNasdaqIPOs(),
    fetchUpcomingIPOs(),
  ]);

  const nasdaqUpcoming = nasdaqResult.status === "fulfilled" ? nasdaqResult.value.upcoming : [];
  const nasdaqFiled    = nasdaqResult.status === "fulfilled" ? nasdaqResult.value.filed    : [];
  const finnhubIPOs    = finnhubResult.status === "fulfilled" ? finnhubResult.value         : [];

  const seenSymbols = new Set(nasdaqUpcoming.map(i => i.symbol));
  const finnhubExtra = finnhubIPOs.filter(
    i => i.symbol && !seenSymbols.has(i.symbol) && i.date >= today
  );
  const allUpcoming = [...nasdaqUpcoming, ...finnhubExtra].map(ipo => ({
    ...ipo,
    isTech: ipo.isTech || isTechSector(ipo.sector),
  }));

  const toEnrich = allUpcoming.slice(0, 10);
  const newsCounts = await Promise.allSettled(toEnrich.map(ipo => fetchNewsCount(ipo.company)));
  const enriched = toEnrich.map((ipo, i) => ({
    ...ipo,
    newsCount: newsCounts[i].status === "fulfilled" ? newsCounts[i].value : 0,
  }));
  const scoredUpcoming = scoreIPOs([...enriched, ...allUpcoming.slice(10)]);

  const scoredFiled = nasdaqFiled.map(ipo => ({
    ...ipo,
    isTech: ipo.isTech || isTechSector(ipo.sector),
  }));

  return { upcoming: scoredUpcoming, filed: scoredFiled };
}

async function getRecentData(): Promise<IPO[]> {
  const rawIpos = await fetchRecentIPOs().catch(() => [] as IPO[]);

  const toQuote = rawIpos.slice(0, 25);
  const quoteResults = await Promise.allSettled(
    toQuote.map((ipo) => fetchStockQuote(ipo.symbol))
  );

  return rawIpos.map((ipo, idx) => {
    if (idx >= 25) return ipo;
    const result = quoteResults[idx];
    if (result.status !== "fulfilled" || !result.value) return ipo;
    const quote = result.value;
    const ipoPrice = ipo.ipoPrice;
    const currentPrice = quote.current;
    const perfPct =
      ipoPrice && ipoPrice > 0
        ? ((currentPrice - ipoPrice) / ipoPrice) * 100
        : undefined;
    return { ...ipo, currentPrice, perfPct };
  });
}

async function getSpeculationData(): Promise<NewsItem[][]> {
  const newsResults = await Promise.allSettled(
    SPECULATIVE_IPOS.map((c) => fetchNewsForCompany(c.name))
  );
  return newsResults.map((r) => (r.status === "fulfilled" ? r.value : []));
}

interface HomePageProps {
  searchParams: Promise<{ sector?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const activeSector = params.sector || "All";

  const [{ upcoming, filed }, recentIpos, specNewsMap] = await Promise.all([
    getData(),
    getRecentData(),
    getSpeculationData(),
  ]);

  const allIPOs = [...upcoming, ...filed];
  const sectors = Array.from(new Set(allIPOs.map(ipo => ipo.sector).filter(Boolean))).sort();

  return (
    <Suspense fallback={null}>
      <HomeTabsClient
        upcoming={upcoming}
        filed={filed}
        sectors={sectors}
        activeSector={activeSector}
        recentIpos={recentIpos}
        specNewsMap={specNewsMap}
      />
    </Suspense>
  );
}
