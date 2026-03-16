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
  const techCount = allIPOs.filter(ipo => ipo.isTech).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1A1A1A", background: "#0D0D0D", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 8px #00FF41, 0 0 16px #00FF4160", animation: "blink 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 18, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em" }}>
              IPO<span style={{ color: "#00FF41" }}>radar</span>
            </span>
          </div>
          <div className="header-stats" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
              <span style={{ color: "#F0F0F0", fontWeight: 600 }}>{upcoming.length}</span> confirmed
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
              <span style={{ color: "#6A6A6A", fontWeight: 600 }}>{filed.length}</span> filed
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
              <span style={{ color: "#00FF41", fontWeight: 600 }}>{techCount}</span> tech
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px clamp(16px, 4vw, 24px) 0",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 12px 0" }}>
          Upcoming IPO Calendar {new Date().getFullYear()}
          <span style={{ color: "#00FF41", animation: "blink 1.2s step-end infinite" }}>_</span>
        </h1>

        {/* Compact stats row */}
        {(() => {
          const nextIPORaw = [...upcoming].sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
          const nextIPOLabel = nextIPORaw
            ? new Date(nextIPORaw + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "TBD";
          return (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0, borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A", padding: "8px 0", marginBottom: 0 }}>
              {[
                { value: upcoming.length, label: "confirmed", accent: "#00FF41" },
                { value: filed.length, label: "filed", accent: "#6A6A6A" },
                { value: techCount, label: "tech", accent: "#00FF41" },
                { value: nextIPOLabel, label: "next", accent: "#F0F0F0" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 5, paddingLeft: i > 0 ? 16 : 0, paddingRight: 16, borderLeft: i > 0 ? "1px solid #1A1A1A" : "none" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 15, fontWeight: 600, color: s.accent, lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                </div>
              ))}
            </div>
          );
        })()}
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
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 640px) {
          .header-stats { display: none !important; }
        }
      `}</style>
    </div>
  );
}
