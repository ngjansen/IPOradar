"use client";

import { useState } from "react";
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

export function HomeTabsClient({
  upcoming,
  filed,
  sectors,
  activeSector,
  recentIpos,
  specNewsMap,
}: HomeTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");

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
      {/* Tab bar — sticky below header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#0F0F0F",
          borderBottom: "1px solid #1E1E1E",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 24px)",
            display: "flex",
            gap: 0,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid #00FF41" : "2px solid transparent",
                  paddingTop: 0,
                  paddingBottom: 0,
                  paddingLeft: 20,
                  paddingRight: 20,
                  height: 52,
                  cursor: "pointer",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "border-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const label = (e.currentTarget as HTMLElement).querySelector(".tab-label") as HTMLElement | null;
                  if (label && !isActive) label.style.color = "#6A6A6A";
                }}
                onMouseLeave={(e) => {
                  const label = (e.currentTarget as HTMLElement).querySelector(".tab-label") as HTMLElement | null;
                  if (label && !isActive) label.style.color = "#4A4A4A";
                }}
              >
                <span
                  className="tab-label"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#F0F0F0" : "#4A4A4A",
                    letterSpacing: "-0.01em",
                    transition: "color 0.15s ease",
                  }}
                >
                  {tab.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? "#00FF41" : "#3A3A3A",
                    background: isActive ? "#00FF4120" : "#1A1A1A",
                    borderRadius: 10,
                    padding: "2px 8px",
                    transition: "color 0.15s ease, background 0.15s ease",
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
        <main
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 24px) 80px",
          }}
        >
          <IPOGrid upcoming={upcoming} filed={filed} activeSector={activeSector} sectors={sectors} />
        </main>
      )}

      {activeTab === "recent" && (
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 24px) 80px",
          }}
        >
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 3, height: 22, borderRadius: 2, background: "#FFB800", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "#FFB800", opacity: 0.6, letterSpacing: "0.15em", marginBottom: 2 }}>// rumoured · unconfirmed</div>
              <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1, margin: 0 }}>
                IPO Watch
              </h2>
            </div>
          </div>

          {/* Disclaimer banner */}
          <div
            style={{
              background: "#141200",
              border: "1px solid #2A2000",
              borderLeft: "3px solid #FFB800",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#FFB800", flexShrink: 0 }}>⚠</span>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#6A5A30", margin: 0, lineHeight: 1.5 }}>
              No SEC filings. Coverage based on public news and analyst commentary. Not financial advice.
            </p>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28, maxWidth: 400 }}>
            <div style={{ flex: 1, background: "linear-gradient(135deg, #141200 0%, #131100 100%)", border: "1px solid #2A2000", borderTop: "2px solid #FFB800", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 9, color: "#6A5000", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Tracked</div>
              <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 40, fontWeight: 700, color: "#FFB800", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {SPECULATIVE_IPOS.length}
              </div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A3A00", marginTop: 6 }}>companies</div>
            </div>
            <div style={{ flex: 1, background: "#0F0F0F", border: "1px solid #1E1E1E", borderTop: "2px solid #2A2A2A", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 9, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Articles</div>
              <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 40, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {totalArticles}
              </div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", marginTop: 6 }}>recent news</div>
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
