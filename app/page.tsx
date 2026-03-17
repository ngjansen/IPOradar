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

  // Fetch Nasdaq (primary) and Finnhub (supplementary) in parallel
  const [nasdaqResult, finnhubResult] = await Promise.allSettled([
    fetchNasdaqIPOs(),
    fetchUpcomingIPOs(),
  ]);

  const nasdaqUpcoming = nasdaqResult.status === "fulfilled" ? nasdaqResult.value.upcoming : [];
  const nasdaqFiled    = nasdaqResult.status === "fulfilled" ? nasdaqResult.value.filed    : [];
  const finnhubIPOs    = finnhubResult.status === "fulfilled" ? finnhubResult.value         : [];

  // Merge upcoming: Nasdaq is primary, add any Finnhub entries not already present
  const seenSymbols = new Set(nasdaqUpcoming.map(i => i.symbol));
  const finnhubExtra = finnhubIPOs.filter(
    i => i.symbol && !seenSymbols.has(i.symbol) && i.date >= today
  );
  const allUpcoming = [...nasdaqUpcoming, ...finnhubExtra].map(ipo => ({
    ...ipo,
    isTech: ipo.isTech || isTechSector(ipo.sector),
  }));

  // Enrich upcoming with news counts (cap at 10)
  const toEnrich = allUpcoming.slice(0, 10);
  const newsCounts = await Promise.allSettled(toEnrich.map(ipo => fetchNewsCount(ipo.company)));
  const enriched = toEnrich.map((ipo, i) => ({
    ...ipo,
    newsCount: newsCounts[i].status === "fulfilled" ? newsCounts[i].value : 0,
  }));
  const scoredUpcoming = scoreIPOs([...enriched, ...allUpcoming.slice(10)]);

  // Filed: just Nasdaq, enrich isTech
  const scoredFiled = nasdaqFiled.map(ipo => ({
    ...ipo,
    isTech: ipo.isTech || isTechSector(ipo.sector),
  }));

  return { upcoming: scoredUpcoming, filed: scoredFiled };
}

async function getRecentData(): Promise<IPO[]> {
  const rawIpos = await fetchRecentIPOs().catch(() => [] as IPO[]);

  // Fetch quotes for first 25 IPOs in parallel
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

  const nextIPO = [...upcoming].sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  const nextIPOLabel = nextIPO?.date
    ? new Date(nextIPO.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "TBD";

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", backgroundImage: "radial-gradient(circle, #1E1E1E 1px, transparent 1px)", backgroundSize: "24px 24px" }}>

        {/* Atmospheric green halo glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, #00FF4110 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Faint horizontal scan-line */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, #00FF4104 40%, transparent 70%)", pointerEvents: "none" }} />

        {/* Content */}
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "clamp(24px, 3vw, 36px) clamp(16px, 4vw, 24px) clamp(12px, 2vw, 20px)" }}>

          {/* Brand row — replaces header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 15, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em" }}>
                IPO<span style={{ color: "#00FF41" }}>radar</span>
              </span>
              <span style={{ color: "#3A3A3A", fontSize: 13 }}>•</span>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 6px #00FF41, 0 0 12px #00FF4160", animation: "blink 2s ease-in-out infinite" }} />
            </div>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A", letterSpacing: "0.02em" }}>
              {upcoming.length} confirmed · {filed.length} filed · Next: {nextIPOLabel}
            </span>
          </div>

          {/* Title + tagline */}
          <div style={{ marginBottom: "clamp(24px, 4vw, 32px)" }}>
            {/* Pre-title */}
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#00FF41", opacity: 0.6, letterSpacing: "0.15em", marginBottom: 12, animation: "fadeInUp 0.4s ease both", animationDelay: "0s" }}>
              Real-time IPO intelligence
            </div>
            {/* H1 */}
            <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1, margin: 0, animation: "fadeInUp 0.4s ease both", animationDelay: "0.08s" }}>
              IPO Radar
              <span style={{ color: "#00FF41", textShadow: "0 0 12px #00FF4180", animation: "blink 1.2s step-end infinite" }}>_</span>
            </h1>
            {/* Tagline */}
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(13px, 1.5vw, 16px)", color: "#6A6A6A", lineHeight: 1.6, maxWidth: 600, margin: "12px 0 0 0", animation: "fadeInUp 0.4s ease both", animationDelay: "0.16s" }}>
              Never miss a market debut. Track every IPO from SEC filing to first trade — with hype scores, price ranges, and sector filters.
            </p>
          </div>

          {/* Separator — visually bridges hero into tab bar */}
          <div style={{ height: 1, background: "linear-gradient(90deg, #1E1E1E 0%, #00FF4120 30%, #1E1E1E 100%)" }} />

        </div>
      </section>

      {/* Tab interface */}
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

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1A1A1A", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#3A3A3A", margin: "0 0 8px 0", lineHeight: 1.6 }}>
            IPO filing data sourced from{" "}
            <a href="https://www.nasdaq.com/market-activity/ipos" target="_blank" rel="noopener noreferrer" style={{ color: "#4A4A4A", textDecoration: "underline", textDecorationColor: "#2A2A2A" }}>Nasdaq EDGAR</a>
            {" "}and{" "}
            <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" style={{ color: "#4A4A4A", textDecoration: "underline", textDecorationColor: "#2A2A2A" }}>Finnhub</a>.
            {" "}News via{" "}
            <a href="https://news.google.com" target="_blank" rel="noopener noreferrer" style={{ color: "#4A4A4A", textDecoration: "underline", textDecorationColor: "#2A2A2A" }}>Google News</a>.
            {" "}Data refreshed every hour.
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#2A2A2A", margin: 0 }}>
            Not financial advice. For informational purposes only.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes blink    { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
