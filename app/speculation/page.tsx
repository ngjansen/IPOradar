import Link from "next/link";
import type { Metadata } from "next";
import { SPECULATIVE_IPOS } from "@/lib/speculation";
import { fetchNewsForCompany } from "@/lib/news";
import { SpeculationCard } from "@/components/SpeculationCard";
import type { NewsItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "IPO Watch — IPOradar",
  description: "High-profile private companies rumored to be eyeing an IPO. Curated list with latest news.",
};

export const revalidate = 14400; // 4 hours

export default async function SpeculationPage() {
  const newsResults = await Promise.allSettled(
    SPECULATIVE_IPOS.map((c) => fetchNewsForCompany(c.name))
  );

  const newsMap: NewsItem[][] = newsResults.map((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  const totalArticles = newsMap.reduce((sum, items) => sum + items.length, 0);

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
          Speculation
        </span>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header eyebrow */}
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              color: "#FFB800",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            // rumoured · unconfirmed
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
          IPO Watch
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
          High-profile private companies where an IPO has been discussed in the press — but nothing has been filed or confirmed.
        </p>

        {/* Disclaimer banner */}
        <div
          style={{
            background: "#FFB80008",
            border: "1px solid #FFB80025",
            borderLeft: "3px solid #FFB80060",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 28,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              color: "#FFB800",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            ⚠
          </span>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "#8A7A5A",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            These companies have not filed with the SEC. Coverage is based on publicly available news and analyst commentary. Nothing here constitutes financial advice.
          </p>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
            marginBottom: 32,
            maxWidth: 480,
          }}
        >
          <div
            style={{
              background: "#141414",
              border: "1px solid #1E1E1E",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#4A4A4A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              Total Tracked
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: 28,
                fontWeight: 700,
                color: "#FFB800",
                letterSpacing: "-0.03em",
              }}
            >
              {SPECULATIVE_IPOS.length}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#4A4A4A",
                marginTop: 4,
              }}
            >
              companies
            </div>
          </div>

          <div
            style={{
              background: "#141414",
              border: "1px solid #1E1E1E",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#4A4A4A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              Total News Articles
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: 28,
                fontWeight: 700,
                color: "#F0F0F0",
                letterSpacing: "-0.03em",
              }}
            >
              {totalArticles}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#4A4A4A",
                marginTop: 4,
              }}
            >
              recent articles
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
            gap: 12,
          }}
        >
          {SPECULATIVE_IPOS.map((company, i) => (
            <SpeculationCard
              key={company.name}
              company={company}
              news={newsMap[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
