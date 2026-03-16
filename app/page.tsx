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

  const nextIPO = [...upcoming].sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  const nextIPOLabel = nextIPO?.date
    ? new Date(nextIPO.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "TBD";

  // Top hype IPO (for spotlight card)
  const topHypeIPO = [...upcoming].sort((a, b) => b.hypeScore - a.hypeScore)[0] ?? nextIPO;
  const topHypeLabel = topHypeIPO?.date
    ? new Date(topHypeIPO.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "TBD";

  // Top 3 by hype score for the preview strip
  const top3 = [...upcoming].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, 3);

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
      <section style={{ position: "relative", overflow: "hidden", backgroundImage: "radial-gradient(circle, #1E1E1E 1px, transparent 1px)", backgroundSize: "24px 24px" }}>

        {/* Atmospheric green halo glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, #00FF4110 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Faint horizontal scan-line */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, #00FF4104 40%, transparent 70%)", pointerEvents: "none" }} />

        {/* Content */}
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "clamp(32px, 5vw, 52px) clamp(16px, 4vw, 24px) clamp(24px, 4vw, 36px)" }}>

          {/* Two-column: title+tagline LEFT, next-IPO spotlight RIGHT */}
          <div className="hero-layout" style={{ display: "flex", alignItems: "flex-start", gap: 32, marginBottom: "clamp(24px, 4vw, 32px)" }}>

            {/* LEFT */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Pre-title */}
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#00FF41", opacity: 0.6, letterSpacing: "0.15em", marginBottom: 12, animation: "fadeInUp 0.4s ease both", animationDelay: "0s" }}>
                // live market intelligence
              </div>
              {/* H1 */}
              <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1, margin: 0, animation: "fadeInUp 0.4s ease both", animationDelay: "0.08s" }}>
                IPO Tracker
                <span style={{ color: "#00FF41", textShadow: "0 0 12px #00FF4180", animation: "blink 1.2s step-end infinite" }}>_</span>
              </h1>
              {/* Tagline */}
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(13px, 1.5vw, 16px)", color: "#6A6A6A", lineHeight: 1.6, maxWidth: 480, margin: "12px 0 0 0", animation: "fadeInUp 0.4s ease both", animationDelay: "0.16s" }}>
                Track every IPO from filing to first trade. Real-time data, hype scores, and sector filters — built for retail investors.
              </p>
            </div>

            {/* RIGHT: top hype IPO spotlight card (only if upcoming IPOs exist) */}
            {topHypeIPO && (
              <div className="hero-spotlight" style={{ flexShrink: 0, width: "clamp(220px, 28vw, 300px)", background: "linear-gradient(135deg, #111111 0%, #141414 100%)", border: "1px solid #1E1E1E", borderTop: "1px solid #00FF4140", borderRadius: 12, padding: "16px 20px", position: "relative", overflow: "hidden", animation: "fadeInUp 0.4s ease both", animationDelay: "0.24s" }}>
                {/* Card inner glow */}
                <div style={{ position: "absolute", top: -20, left: -20, width: 120, height: 120, background: "radial-gradient(circle, #00FF4115 0%, transparent 70%)", pointerEvents: "none" }} />
                {/* Label */}
                <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "#00FF41", opacity: 0.7, letterSpacing: "0.15em", marginBottom: 12 }}>// top pick</div>
                {/* Company */}
                <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(15px, 2vw, 18px)", fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {topHypeIPO.company}
                </div>
                {/* Hype score */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hype Score</span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, fontWeight: 700, color: "#00FF41" }}>{topHypeIPO.hypeScore}</span>
                  </div>
                  <div style={{ height: 3, background: "#1A1A1A", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(topHypeIPO.hypeScore, 100)}%`, background: "linear-gradient(90deg, #00FF41 0%, #00CC33 100%)", borderRadius: 2, boxShadow: "0 0 6px #00FF4160" }} />
                  </div>
                </div>
                {/* Symbol + date pill */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  {topHypeIPO.symbol && (
                    <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#6A6A6A", fontWeight: 600 }}>{topHypeIPO.symbol}</span>
                  )}
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, fontWeight: 600, color: "#0D0D0D", background: "#00FF41", borderRadius: 4, padding: "2px 7px", letterSpacing: "0.05em" }}>
                    {topHypeLabel}
                  </span>
                </div>
                {/* Sector + price range */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {topHypeIPO.sector && (
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 4, padding: "2px 7px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {topHypeIPO.sector}
                    </span>
                  )}
                  {topHypeIPO.priceRange && topHypeIPO.priceRange !== "TBD" && topHypeIPO.priceRange !== "" && (
                    <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#9A9A9A" }}>
                      {topHypeIPO.priceRange}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Compact counts */}
          <div style={{ display: "flex", gap: 16, marginBottom: 12, animation: "fadeInUp 0.4s ease both", animationDelay: "0.28s" }}>
            {[
              { value: upcoming.length, label: "confirmed", color: "#00FF41" },
              { value: filed.length,    label: "filed",     color: "#5A5A5A" },
              { value: techCount,       label: "tech",      color: "#00FF41" },
            ].map((s, i) => (
              <div key={i} style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>
                {" "}{s.label}
              </div>
            ))}
          </div>

          {/* Top 3 by hype score */}
          {top3.length > 0 && (
            <div className="hero-top3" style={{ display: "flex", gap: 8, animation: "fadeInUp 0.4s ease both", animationDelay: "0.32s" }}>
              {top3.map((ipo, i) => {
                const dateLabel = ipo.date
                  ? new Date(ipo.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "TBD";
                const rankColors = ["#00FF41", "#6A6A6A", "#4A4A4A"] as const;
                return (
                  <div key={ipo.symbol} style={{ flex: 1, minWidth: 0, background: "#111111", border: "1px solid #1E1E1E", borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
                    {/* Rank */}
                    <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: rankColors[i], fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>#{i + 1}</div>
                    {/* Company */}
                    <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 14, fontWeight: 700, color: "#E0E0E0", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ipo.company}
                    </div>
                    {/* Ticker + date */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      {ipo.symbol && (
                        <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "#5A5A5A" }}>{ipo.symbol}</span>
                      )}
                      <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, fontWeight: 600, color: i === 0 ? "#0D0D0D" : "#9A9A9A", background: i === 0 ? "#00FF41" : "#1A1A1A", borderRadius: 3, padding: "1px 6px" }}>
                        {dateLabel}
                      </span>
                      {ipo.sector && (
                        <span style={{ fontFamily: "var(--font-inter)", fontSize: 9, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.06em" }}>{ipo.sector}</span>
                      )}
                    </div>
                    {/* Hype bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 2, background: "#1A1A1A", borderRadius: 1, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(ipo.hypeScore, 100)}%`, background: i === 0 ? "#00FF41" : "#3A3A3A", borderRadius: 1 }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, fontWeight: 600, color: i === 0 ? "#00FF41" : "#4A4A4A", flexShrink: 0 }}>{ipo.hypeScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Separator — visually bridges hero into tab bar */}
          <div style={{ marginTop: "clamp(20px, 3vw, 28px)", height: 1, background: "linear-gradient(90deg, #1E1E1E 0%, #00FF4120 30%, #1E1E1E 100%)" }} />

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
        @media (max-width: 640px) {
          .header-stats    { display: none !important; }
          .hero-layout     { flex-direction: column !important; gap: 24px !important; }
          .hero-spotlight  { width: 100% !important; max-width: 100% !important; }
          .hero-top3       { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
