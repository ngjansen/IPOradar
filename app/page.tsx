import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { SectorFilter } from "@/components/SectorFilter";
import { IPOGrid } from "@/components/IPOGrid";
import { fetchUpcomingIPOs } from "@/lib/finnhub";
import { fetchNasdaqIPOs } from "@/lib/nasdaq";
import { fetchNewsCount } from "@/lib/news";
import { scoreIPOs, isTechSector } from "@/lib/scoring";
import type { IPO } from "@/lib/types";

export const metadata: Metadata = {
  title: `Upcoming IPO Calendar ${new Date().getFullYear()} — Discover New Public Offerings`,
  description:
    "Track upcoming IPOs ranked by hype score. Real-time news, price ranges, and sector filters for retail investors.",
};

export const revalidate = 14400;

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

  // Enrich upcoming with news counts (cap at 20)
  const toEnrich = allUpcoming.slice(0, 10);
  const newsCounts = await Promise.allSettled(toEnrich.map(ipo => fetchNewsCount(ipo.company)));
  const enriched = toEnrich.map((ipo, i) => ({
    ...ipo,
    newsCount: newsCounts[i].status === "fulfilled" ? newsCounts[i].value : 0,
  }));
  const scoredUpcoming = scoreIPOs([...enriched, ...allUpcoming.slice(20)]);

  // Filed: just Nasdaq, enrich isTech
  const scoredFiled = nasdaqFiled.map(ipo => ({
    ...ipo,
    isTech: ipo.isTech || isTechSector(ipo.sector),
  }));

  return { upcoming: scoredUpcoming, filed: scoredFiled };
}

interface HomePageProps {
  searchParams: Promise<{ sector?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const activeSector = params.sector || "All";

  const { upcoming, filed } = await getData();

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
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
              <span style={{ color: "#F0F0F0", fontWeight: 600 }}>{upcoming.length}</span> confirmed
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
              <span style={{ color: "#6A6A6A", fontWeight: 600 }}>{filed.length}</span> filed
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
              <span style={{ color: "#00FF41", fontWeight: 600 }}>{techCount}</span> tech
            </div>
            <Link href="/recent" className="recent-nav-link">
              Recent IPOs
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#00FF41", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            // live tracker
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0, marginBottom: 12 }}>
          Upcoming IPO Calendar {new Date().getFullYear()}
        </h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "#6A6A6A", maxWidth: 520, lineHeight: 1.6, margin: "0 0 24px 0" }}>
          Confirmed IPOs with set dates, plus all recently filed S-1s. Updated every 4 hours.
        </p>

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
      </section>

      {/* Filters */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 24px" }}>
        <Suspense fallback={null}>
          <SectorFilter sectors={sectors} />
        </Suspense>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px" }}>
        <IPOGrid upcoming={upcoming} filed={filed} activeSector={activeSector} />
      </main>

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
            {" "}Data refreshed every 4 hours.
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#2A2A2A", margin: 0 }}>
            Not financial advice. For informational purposes only.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .recent-nav-link {
          font-family: var(--font-inter);
          font-size: 12px;
          color: #6A6A6A;
          text-decoration: none;
          border: 1px solid #222;
          border-radius: 6px;
          padding: 4px 10px;
          transition: color 0.15s, border-color 0.15s;
        }
        .recent-nav-link:hover { color: #F0F0F0; border-color: #3A3A3A; }
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
      `}</style>
    </div>
  );
}
