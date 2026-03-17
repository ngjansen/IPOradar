"use client";

import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const topNews = news.slice(0, 3);
  const totalArticles = news.length;
  const lastChecked = news[0]?.publishedAt
    ? formatDate(news[0].publishedAt)
    : "—";

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open]);

  const sortedNews = [...news].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          background: "linear-gradient(135deg, #141200 0%, #131100 100%)",
          border: "1px solid #2A2200",
          borderLeft: "3px solid #FFB800",
          borderRadius: 12,
          padding: "20px",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          cursor: "pointer",
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
                  onClick={(e) => e.stopPropagation()}
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

      {/* Detail Modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 680,
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#0D0D0D",
              border: "1px solid #2A2200",
              borderLeft: "3px solid #FFB800",
              borderRadius: 12,
              padding: "28px 28px 24px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: 22,
                      color: "#F0F0F0",
                      lineHeight: 1.2,
                    }}
                  >
                    {company.name}
                  </span>
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

                {/* Metadata row */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
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
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#6A5A30" }}>
                    {company.timeline}
                  </span>
                </div>

                {/* Description */}
                {company.description && (
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13,
                      color: "#9A8A60",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {company.description}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4A4A4A",
                  fontSize: 20,
                  cursor: "pointer",
                  padding: "0 0 0 16px",
                  lineHeight: 1,
                  flexShrink: 0,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#FFB800"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#4A4A4A"; }}
              >
                ×
              </button>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #1E1800", margin: "18px 0" }} />

            {/* News section label */}
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "#FFB800",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              // {news.length} article{news.length !== 1 ? "s" : ""}
            </div>

            {/* All news items */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {sortedNews.length > 0 ? (
                sortedNews.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid #1E1800",
                      paddingTop: i === 0 ? 0 : 12,
                      paddingBottom: 12,
                    }}
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 13,
                        color: "#8A7A50",
                        textDecoration: "none",
                        display: "block",
                        lineHeight: 1.5,
                        marginBottom: 4,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C0A840"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8A7A50"; }}
                    >
                      {item.title}
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: item.snippet ? 6 : 0 }}>
                      {item.source && (
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: 10,
                            color: "#4A3A00",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {item.source}
                        </span>
                      )}
                      {item.source && item.publishedAt && (
                        <span style={{ color: "#2A2000", fontSize: 10 }}>·</span>
                      )}
                      {item.publishedAt && (
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: 10,
                            color: "#4A3A00",
                          }}
                        >
                          {formatDate(item.publishedAt)}
                        </span>
                      )}
                    </div>
                    {item.snippet && (
                      <div
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 12,
                          color: "#6A5A30",
                          lineHeight: 1.5,
                          paddingLeft: 12,
                          borderLeft: "2px solid #2A1800",
                        }}
                      >
                        {item.snippet}
                      </div>
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
                  No recent news
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ borderTop: "1px solid #1E1800", marginTop: 18, paddingTop: 14 }}>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 10,
                  color: "#2A2000",
                }}
              >
                Data via Google News · Not financial advice.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
