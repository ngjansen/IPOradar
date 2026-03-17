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
        background: "linear-gradient(135deg, #141200 0%, #131100 100%)",
        border: "1px solid #2A2200",
        borderLeft: "3px solid #FFB800",
        borderRadius: 12,
        padding: "20px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 32px #FFB80015";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "";
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
            fontSize: 9,
            color: "#0D0D0D",
            background: "#FFB800",
            borderRadius: 4,
            padding: "3px 8px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          RUMOURED
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
            background: "#1A1500",
            border: "1px solid #2A2000",
            borderRadius: 4,
            padding: "2px 7px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {company.sector}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            color: "#FFB800",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          {company.valuation}
        </span>
        <span style={{ color: "#2A2000", fontSize: 10 }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 10,
            color: "#6A5A30",
          }}
        >
          {company.timeline}
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #1E1E1E", marginBottom: 14 }} />

      {/* Zone 3: News headlines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 14 }}>
        {topNews.length > 0 ? (
          topNews.map((item, i) => (
            <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid #1E1800", paddingTop: i === 0 ? 0 : 8, paddingBottom: 8 }}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  color: "#8A7A50",
                  textDecoration: "none",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.4,
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C0A840"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8A7A50"; }}
              >
                {item.title}
              </a>
              {item.source && (
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 9,
                    color: "#3A3000",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
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
              color: "#3A3A30",
              fontStyle: "italic",
            }}
          >
            No recent news found
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
