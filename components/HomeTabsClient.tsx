"use client";

import { useState, Suspense } from "react";
import { SectorFilter } from "./SectorFilter";
import { IPOGrid } from "./IPOGrid";
import { RecentIPOsClient } from "./RecentIPOsClient";
import { SpeculationCard } from "./SpeculationCard";
import { SPECULATIVE_IPOS } from "@/lib/speculation";
import type { IPO, NewsItem } from "@/lib/types";

interface HomeTabsClientProps {
  upcoming: IPO[];
  filed: IPO[];
  sectors: string[];
  activeSector: string;
  recentIpos: IPO[];
  specNewsMap: NewsItem[][];
}

type TabId = "upcoming" | "recent" | "speculation";

function formatPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function HomeTabsClient({
  upcoming,
  filed,
  sectors,
  activeSector,
  recentIpos,
  specNewsMap,
}: HomeTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");

  // Recent panel stats
  const withPerf = recentIpos.filter((i) => typeof i.perfPct === "number");
  const quotedCount = withPerf.length;
  const bestPerformer =
    withPerf.length > 0
      ? withPerf.reduce((a, b) => (b.perfPct! > a.perfPct! ? b : a))
      : null;
  const worstPerformer =
    withPerf.length > 0
      ? withPerf.reduce((a, b) => (b.perfPct! < a.perfPct! ? b : a))
      : null;
  const winners = withPerf.filter((i) => i.perfPct! > 0).length;
  const losers = withPerf.filter((i) => i.perfPct! < 0).length;
  const winRate =
    quotedCount > 0 ? Math.round((winners / quotedCount) * 100) : null;
  const avgPerf =
    quotedCount > 0
      ? withPerf.reduce((s, i) => s + i.perfPct!, 0) / quotedCount
      : null;

  // Speculation panel stats
  const totalArticles = specNewsMap.reduce(
    (sum, items) => sum + items.length,
    0
  );

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming IPOs", count: upcoming.length + filed.length },
    { id: "recent", label: "Recent IPOs", count: recentIpos.length },
    { id: "speculation", label: "Speculation", count: SPECULATIVE_IPOS.length },
  ];

  return (
    <div>
      {/* Tab bar — segmented pill control */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px clamp(16px, 4vw, 24px) 0",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            background: "#111111",
            border: "1px solid #1E1E1E",
            borderRadius: 8,
            padding: 4,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? "#1A1A1A" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  borderLeft: isActive ? "2px solid #00FF41" : "2px solid transparent",
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 14,
                  paddingRight: 14,
                  cursor: "pointer",
                  outline: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  flexShrink: 0,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: isActive ? "#F0F0F0" : "#9A9A9A",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "#C0C0C0";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "#9A9A9A";
                  }}
                >
                  {tab.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 10,
                    color: isActive ? "#6A6A6A" : "#4A4A4A",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content panels */}
      {activeTab === "upcoming" && (
        <div>
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 clamp(16px, 4vw, 24px) 16px",
            }}
          >
            <Suspense fallback={null}>
              <SectorFilter sectors={sectors} />
            </Suspense>
          </div>
          <main
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 clamp(16px, 4vw, 24px) 80px",
            }}
          >
            <IPOGrid upcoming={upcoming} filed={filed} activeSector={activeSector} />
          </main>
        </div>
      )}

      {activeTab === "recent" && (
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 24px) 80px",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "#6A6A6A",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              // last 90 days
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(20px, 3vw, 32px)",
              fontWeight: 700,
              color: "#F0F0F0",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              margin: "0 0 8px 0",
            }}
          >
            Recent IPOs
          </h2>
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
          {recentIpos.length > 0 && (
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
                  Total IPOs
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
                  {recentIpos.length}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 11,
                    color: "#4A4A4A",
                    marginTop: 4,
                  }}
                >
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
                  Best Performer
                </div>
                {bestPerformer ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 13,
                        color: "#00FF41",
                        fontWeight: 700,
                      }}
                    >
                      ${bestPerformer.symbol}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#00FF41",
                      }}
                    >
                      {formatPct(bestPerformer.perfPct!)}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}
                  >
                    —
                  </div>
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
                  Worst Performer
                </div>
                {worstPerformer ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 13,
                        color: "#FF4444",
                        fontWeight: 700,
                      }}
                    >
                      ${worstPerformer.symbol}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#FF4444",
                      }}
                    >
                      {formatPct(worstPerformer.perfPct!)}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}
                  >
                    —
                  </div>
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
                  Win Rate
                </div>
                {winRate !== null ? (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--font-space-grotesk)",
                        fontSize: 28,
                        fontWeight: 700,
                        color: winRate >= 50 ? "#00FF41" : "#FF4444",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {winRate}%
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 11,
                        color: "#4A4A4A",
                        marginTop: 4,
                      }}
                    >
                      {winners}W · {losers}L of {quotedCount}
                    </div>
                  </>
                ) : (
                  <div
                    style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}
                  >
                    —
                  </div>
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
                  Avg Return
                </div>
                {avgPerf !== null ? (
                  <div
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      fontSize: 28,
                      fontWeight: 700,
                      color: avgPerf >= 0 ? "#00FF41" : "#FF4444",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {formatPct(avgPerf)}
                  </div>
                ) : (
                  <div
                    style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, color: "#2A2A2A" }}
                  >
                    —
                  </div>
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
              href="https://www.webull.com/ipo"
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

          <RecentIPOsClient ipos={recentIpos} />
        </div>
      )}

      {activeTab === "speculation" && (
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 24px) 80px",
          }}
        >
          {/* Header */}
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
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(20px, 3vw, 32px)",
              fontWeight: 700,
              color: "#F0F0F0",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              margin: "0 0 8px 0",
            }}
          >
            IPO Watch
          </h2>
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
                news={specNewsMap[i]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
