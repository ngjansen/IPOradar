import Link from "next/link";
import type { Metadata } from "next";
import { fetchRecentIPOs } from "@/lib/nasdaq";
import { fetchStockQuote } from "@/lib/finnhub";
import { RecentIPOsClient } from "@/components/RecentIPOsClient";
import type { IPO } from "@/lib/types";

export const metadata: Metadata = {
  title: "Recent IPOs — IPOradar",
  description: "Browse IPOs that have priced in the last 90 days. Real-time data from Nasdaq.",
};

export const revalidate = 3600;

function formatPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export default async function RecentIPOsPage() {
  const rawIpos = await fetchRecentIPOs().catch(() => [] as IPO[]);

  // Fetch quotes for first 25 IPOs in parallel
  const toQuote = rawIpos.slice(0, 25);
  const quoteResults = await Promise.allSettled(
    toQuote.map((ipo) => fetchStockQuote(ipo.symbol))
  );

  const ipos: IPO[] = rawIpos.map((ipo, idx) => {
    if (idx >= 25) return ipo;
    const result = quoteResults[idx];
    if (result.status !== "fulfilled" || !result.value) return ipo;
    const quote = result.value;
    const ipoPrice = ipo.ipoPrice;
    const currentPrice = quote.current;
    const perfPct = ipoPrice && ipoPrice > 0
      ? ((currentPrice - ipoPrice) / ipoPrice) * 100
      : undefined;
    return { ...ipo, currentPrice, perfPct };
  });

  // Stats
  const total = ipos.length;
  const withPerf = ipos.filter((i) => typeof i.perfPct === "number");
  const quotedCount = withPerf.length;
  const bestPerformer = withPerf.length > 0
    ? withPerf.reduce((a, b) => (b.perfPct! > a.perfPct! ? b : a))
    : null;
  const worstPerformer = withPerf.length > 0
    ? withPerf.reduce((a, b) => (b.perfPct! < a.perfPct! ? b : a))
    : null;
  const winners = withPerf.filter((i) => i.perfPct! > 0).length;
  const losers = withPerf.filter((i) => i.perfPct! < 0).length;
  const winRate = quotedCount > 0 ? Math.round((winners / quotedCount) * 100) : null;
  const avgPerf = quotedCount > 0
    ? withPerf.reduce((s, i) => s + i.perfPct!, 0) / quotedCount
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid #1A1A1A",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#0D0D0D",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: 18,
            fontWeight: 700,
            color: "#F0F0F0",
            letterSpacing: "-0.04em",
            textDecoration: "none",
          }}
        >
          IPO<span style={{ color: "#00FF41" }}>radar</span>
        </Link>
        <span style={{ color: "#2A2A2A" }}>›</span>
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            color: "#6A6A6A",
          }}
        >
          Recent IPOs
        </span>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            // last 90 days
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: 700,
            color: "#F0F0F0",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            margin: "0 0 10px 0",
          }}
        >
          Recent IPOs
        </h1>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            color: "#6A6A6A",
            margin: "0 0 24px 0",
            lineHeight: 1.6,
          }}
        >
          IPOs that have priced in the last 90 days, with live post-IPO performance.
        </p>

        {/* Stats bar */}
        {total > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {/* Total IPOs */}
            <div
              style={{
                background: "#141414",
                border: "1px solid #1E1E1E",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Total IPOs
              </div>
              <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 28, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.03em" }}>
                {total}
              </div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#4A4A4A", marginTop: 4 }}>
                {quotedCount} with live quotes
              </div>
            </div>

            {/* Best performer */}
            <div
              style={{
                background: "#141414",
                border: "1px solid #1E1E1E",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Best Performer
              </div>
              {bestPerformer ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, color: "#00FF41", fontWeight: 700 }}>
                    ${bestPerformer.symbol}
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, fontWeight: 700, color: "#00FF41" }}>
                    {formatPct(bestPerformer.perfPct!)}
                  </span>
                </div>
              ) : (
                <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}>—</div>
              )}
            </div>

            {/* Worst performer */}
            <div
              style={{
                background: "#141414",
                border: "1px solid #1E1E1E",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Worst Performer
              </div>
              {worstPerformer ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, color: "#FF4444", fontWeight: 700 }}>
                    ${worstPerformer.symbol}
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, fontWeight: 700, color: "#FF4444" }}>
                    {formatPct(worstPerformer.perfPct!)}
                  </span>
                </div>
              ) : (
                <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}>—</div>
              )}
            </div>

            {/* Win Rate */}
            <div
              style={{
                background: "#141414",
                border: "1px solid #1E1E1E",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Win Rate
              </div>
              {winRate !== null ? (
                <>
                  <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 28, fontWeight: 700, color: winRate >= 50 ? "#00FF41" : "#FF4444", letterSpacing: "-0.03em" }}>
                    {winRate}%
                  </div>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#4A4A4A", marginTop: 4 }}>
                    {winners}W · {losers}L of {quotedCount}
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}>—</div>
              )}
            </div>

            {/* Avg Return */}
            <div
              style={{
                background: "#141414",
                border: "1px solid #1E1E1E",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Avg Return
              </div>
              {avgPerf !== null ? (
                <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 28, fontWeight: 700, color: avgPerf >= 0 ? "#00FF41" : "#FF4444", letterSpacing: "-0.03em" }}>
                  {formatPct(avgPerf)}
                </div>
              ) : (
                <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}>—</div>
              )}
            </div>
          </div>
        )}

        {/* Broker CTA row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            padding: "12px 16px",
            background: "#141414",
            border: "1px solid #222",
            borderRadius: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "#6A6A6A",
              minWidth: 120,
            }}
          >
            Ready to trade these IPOs?
          </span>
          <a
            href="https://robinhood.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#00FF41",
              color: "#0D0D0D",
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 6,
              padding: "6px 12px",
            }}
          >
            Robinhood →
          </a>
          <a
            href="https://www.webull.com/quote/us/ipo"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "transparent",
              color: "#9A9A9A",
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
              borderRadius: 6,
              padding: "6px 12px",
              border: "1px solid #2A2A2A",
            }}
          >
            Webull →
          </a>
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 10,
              color: "#3A3A3A",
            }}
          >
            Not financial advice.
          </span>
        </div>

        {/* Source badge */}
        <div style={{ marginBottom: 28 }}>
          <a
            href="https://www.nasdaq.com/market-activity/ipos"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#141414",
              border: "1px solid #222",
              borderRadius: 6,
              padding: "5px 10px",
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect width="12" height="12" rx="2" fill="#0067B1" />
              <path d="M2 9V3h1.5l2.5 4V3H7.5v6H6L3.5 5v4H2zm5.5 0V3H9v6H7.5z" fill="white" fillOpacity="0.9" />
            </svg>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 500, color: "#9A9A9A" }}>
              Nasdaq EDGAR
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 9, color: "#3A3A3A" }}>
              priced IPOs
            </span>
          </a>
        </div>

        {/* Interactive grid with sort/filter */}
        <RecentIPOsClient ipos={ipos} />
      </div>
    </div>
  );
}
