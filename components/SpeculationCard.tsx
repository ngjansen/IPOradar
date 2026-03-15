"use client";

import type { SpeculativeCompany } from "@/lib/speculation";
import type { NewsItem } from "@/lib/types";
import { LetterAvatar } from "./LetterAvatar";

interface SpeculationCardProps {
  company: SpeculativeCompany;
  news: NewsItem[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function SpeculationCard({ company, news }: SpeculationCardProps) {
  const topNews = news.slice(0, 3);
  const totalArticles = news.length;
  const lastChecked = news[0]?.publishedAt
    ? formatDate(news[0].publishedAt)
    : "—";

  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #1E1E1E",
        borderLeft: "2px solid #FFB80040",
        borderRadius: 12,
        padding: "20px",
        transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "-3px 0 12px #FFB80015";
        el.style.borderColor = "#2A2A2A";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "";
        el.style.borderColor = "#1E1E1E";
      }}
    >
      {/* Zone 1: Avatar + Company Name + UNCONFIRMED badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
        <LetterAvatar name={company.name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: 15,
              color: "#F0F0F0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {company.name}
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#FFB800",
            background: "#FFB80015",
            border: "1px solid #FFB80050",
            borderRadius: 4,
            padding: "2px 7px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            flexShrink: 0,
          }}
        >
          UNCONFIRMED
        </span>
      </div>

      {/* Zone 2: Metadata row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 16,
          paddingLeft: 44,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 10,
            color: "#6A6A6A",
          }}
        >
          {company.sector}
        </span>
        <span style={{ color: "#2A2A2A", fontSize: 10 }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#FFB800",
            fontWeight: 600,
          }}
        >
          {company.valuation}
        </span>
        <span style={{ color: "#2A2A2A", fontSize: 10 }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 10,
            color: "#4A4A4A",
          }}
        >
          {company.timeline}
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #1E1E1E", marginBottom: 14 }} />

      {/* Zone 3: News headlines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {topNews.length > 0 ? (
          topNews.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: "#2A2A2A", fontSize: 10, flexShrink: 0 }}>•</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  color: "#9A9A9A",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  minWidth: 0,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C0C0C0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9A9A9A"; }}
              >
                {item.title}
              </a>
              {item.source && (
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 10,
                    color: "#4A4A4A",
                    flexShrink: 0,
                  }}
                >
                  {item.source}
                </span>
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "#3A3A3A",
              fontStyle: "italic",
            }}
          >
            No recent IPO news found
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #1E1E1E", marginBottom: 14 }} />

      {/* Zone 4: Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            color: "#4A4A4A",
          }}
        >
          {totalArticles} news article{totalArticles !== 1 ? "s" : ""}
        </div>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#3A3A3A",
          }}
        >
          last checked {lastChecked}
        </div>
      </div>
    </div>
  );
}
