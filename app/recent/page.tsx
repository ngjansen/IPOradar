import Link from "next/link";
import type { Metadata } from "next";
import { fetchRecentIPOs } from "@/lib/nasdaq";
import { IPOCard } from "@/components/IPOCard";

export const metadata: Metadata = {
  title: "Recent IPOs — IPOradar",
  description: "Browse IPOs that have priced in the last 90 days. Real-time data from Nasdaq.",
};

export const revalidate = 14400;

export default async function RecentIPOsPage() {
  const ipos = await fetchRecentIPOs().catch(() => []);

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
          IPOs that have priced in the last 90 days.
        </p>

        {/* Source badge */}
        <div style={{ marginBottom: 40 }}>
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

        {/* Grid */}
        {ipos.length === 0 ? (
          <div
            style={{
              background: "#141414",
              border: "1px solid #1A1A1A",
              borderRadius: 12,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#4A4A4A", margin: 0 }}>
              No recent IPOs found. Data refreshes every 4 hours.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {ipos.map((ipo) => (
              <IPOCard key={ipo.symbol} ipo={ipo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
