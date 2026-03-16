import { Suspense } from "react";
import type { Metadata } from "next";
import { IPOAlertSignup } from "@/components/IPOAlertSignup";
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
        className="hero-section"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 24px 20px",
          position: "relative",
          overflow: "hidden",
          backgroundImage: [
            "radial-gradient(ellipse 90% 60% at 50% -10%, #00FF4109 0%, transparent 70%)",
            "linear-gradient(#ffffff03 1px, transparent 1px)",
            "linear-gradient(90deg, #ffffff03 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      >
        {/* Ghost watermark */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 900,
            fontSize: "clamp(160px, 30vw, 320px)",
            color: "#00FF41",
            opacity: 0.03,
            pointerEvents: "none",
            userSelect: "none",
            lineHeight: 1,
            zIndex: 0,
          }}
        >
          IPO
        </div>

        {/* Content above background layers */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Live tracker label */}
          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 6px #00FF41", animation: "blink 2s ease-in-out infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#00FF41", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              // live tracker
            </span>
            <span style={{ background: "#00FF4115", border: "1px solid #00FF4140", color: "#00FF41", fontSize: 9, fontFamily: "var(--font-jetbrains-mono)", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.1em" }}>
              LIVE
            </span>
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(28px, 5vw, 60px)", fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0, marginBottom: 8, textShadow: "0 0 60px #00FF4118, 0 0 120px #00FF410A" }}>
            Upcoming IPO Calendar {new Date().getFullYear()}
            <span style={{ color: "#00FF41", animation: "blink 1.2s step-end infinite" }}>_</span>
          </h1>

          <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "#6A6A6A", maxWidth: 520, lineHeight: 1.6, margin: "0 0 0 0" }}>
            Confirmed IPOs with set dates, plus all recently filed S-1s. Updated every hour.
          </p>

          {/* Stats bar */}
          {(() => {
            const nextIPORaw = [...upcoming].sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
            const nextIPOLabel = nextIPORaw
              ? new Date(nextIPORaw + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "TBD";
            const stats: { value: string | number; label: string; highlight?: boolean }[] = [
              { value: upcoming.length, label: "IPOs this cycle", highlight: true },
              { value: filed.length, label: "S-1 filed" },
              { value: techCount, label: "tech companies" },
              { value: nextIPOLabel, label: "next listing" },
            ];
            return (
              <div className="stats-bar" style={{ display: "flex", gap: 0, borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A", margin: "16px 0 16px", padding: "14px 0" }}>
                {stats.map((stat, i) => (
                  <div key={i} className="stat-cell" style={{ flex: 1, paddingLeft: i > 0 ? 20 : 0, paddingRight: 20, borderLeft: i > 0 ? "1px solid #1A1A1A" : "none" }}>
                    <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 600, color: stat.highlight ? "#00FF41" : "#F0F0F0", lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Email capture */}
          <IPOAlertSignup compact />

          {/* Source badges */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#3A3A3A", marginRight: 4 }}>Sources:</span>

            <a href="https://www.nasdaq.com/market-activity/ipos" target="_blank" rel="noopener noreferrer" className="source-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect width="12" height="12" rx="2" fill="#0067B1"/><path d="M2 9V3h1.5l2.5 4V3H7.5v6H6L3.5 5v4H2zm5.5 0V3H9v6H7.5z" fill="white" fillOpacity="0.9"/></svg>
              <span className="source-name">Nasdaq EDGAR</span>
              <span className="source-desc">IPO filings</span>
            </a>

            <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="source-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect width="12" height="12" rx="2" fill="#1DB954"/><path d="M3 8.5l2-5 2 3.5 1-2 1 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              <span className="source-name">Finnhub</span>
              <span className="source-desc">confirmed calendar</span>
            </a>

            <a href="https://news.google.com" target="_blank" rel="noopener noreferrer" className="source-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect width="12" height="12" rx="2" fill="#222"/><path d="M2 4h8M2 6h5M2 8h6" stroke="#9A9A9A" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span className="source-name">Google News</span>
              <span className="source-desc">live news feed</span>
            </a>

            <span className="source-badge source-badge--static">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect width="12" height="12" rx="2" fill="#1A1A1A"/><circle cx="6" cy="6" r="2" stroke="#00FF41" strokeWidth="1" fill="none"/><path d="M6 2v1M6 9v1M2 6h1M9 6h1" stroke="#3A3A3A" strokeWidth="1" strokeLinecap="round"/></svg>
              <span className="source-name" style={{ color: "#3A3A3A" }}>SEC EDGAR</span>
              <span className="source-desc">via Nasdaq</span>
            </span>
          </div>

          {/* Scrolling ticker */}
          {upcoming.length > 0 && (
            <div style={{ overflow: "hidden", position: "relative", marginTop: 16 }}>
              <div style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)", maskImage: "linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)" }}>
                <div className="ticker-track">
                  {[...upcoming.slice(0, 20), ...upcoming.slice(0, 20)].map((ipo, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", marginRight: 8 }}>
                      <span style={{ color: "#00FF41", fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, fontWeight: 600 }}>${ipo.symbol}</span>
                      <span style={{ color: "#2A2A2A", margin: "0 8px" }}>·</span>
                      <span style={{ color: "#4A4A4A", fontFamily: "var(--font-jetbrains-mono)", fontSize: 11 }}>{ipo.date || "TBD"}</span>
                      {ipo.priceRange && ipo.priceRange !== "TBD" && (
                        <>
                          <span style={{ color: "#2A2A2A", margin: "0 8px" }}>·</span>
                          <span style={{ color: "#4A4A4A", fontFamily: "var(--font-jetbrains-mono)", fontSize: 11 }}>{ipo.priceRange}</span>
                        </>
                      )}
                      <span style={{ color: "#2A2A2A", margin: "0 16px" }}>·</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
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
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          animation: ticker 40s linear infinite;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 0;
        }
        .source-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #141414;
          border: 1px solid #222;
          border-radius: 6px;
          padding: 5px 10px;
          text-decoration: none;
          transition: border-color 0.15s;
        }
        .source-badge:hover { border-color: #3a3a3a; }
        .source-badge--static { cursor: default; }
        .source-name {
          font-family: var(--font-inter);
          font-size: 11px;
          font-weight: 500;
          color: #9A9A9A;
        }
        .source-desc {
          font-family: var(--font-jetbrains-mono);
          font-size: 9px;
          color: #3A3A3A;
        }
        @media (max-width: 640px) {
          .header-stats { display: none !important; }
          .stats-bar { flex-wrap: wrap !important; }
          .stat-cell {
            flex: none !important;
            width: 50% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            border-left: none !important;
            padding-top: 10px;
            padding-bottom: 10px;
          }
          .stat-cell:nth-child(2),
          .stat-cell:nth-child(4) {
            padding-left: 16px !important;
            border-left: 1px solid #1A1A1A !important;
          }
          .stat-cell:nth-child(3),
          .stat-cell:nth-child(4) {
            border-top: 1px solid #1A1A1A;
          }
          .source-desc { display: none; }
        }
        @media (max-width: 480px) {
          .hero-section { padding: 20px 16px 16px !important; }
          .ticker-track { animation-duration: 25s; }
        }
      `}</style>
    </div>
  );
}
