"use client";

import { useEffect, useState } from "react";
import type { NewsItem as NewsItemType } from "@/lib/types";
import { NewsItem } from "./NewsItem";

interface NewsFeedProps {
  company: string;
}

function NewsSkeleton() {
  return (
    <div>
      {/* Pulse skeleton */}
      <div style={{ background: "#141414", border: "1px solid #1E1E1E", borderLeft: "3px solid #00FF4130", borderRadius: 8, padding: "20px", marginBottom: 28 }}>
        {[100, 90, 95].map((w, i) => (
          <div key={i} style={{ height: 13, background: "#1A1A1A", borderRadius: 4, marginBottom: 10, width: `${w}%`, animation: "newsPulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      {/* Article skeletons */}
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ padding: "18px 0", borderBottom: "1px solid #1A1A1A" }}>
          <div style={{ height: 15, background: "#1A1A1A", borderRadius: 4, marginBottom: 8, width: `${70 + i * 7}%`, animation: "newsPulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 11, background: "#1A1A1A", borderRadius: 4, width: "35%", animation: "newsPulse 1.5s ease-in-out infinite" }} />
        </div>
      ))}
      <style>{`@keyframes newsPulse { 0%,100%{opacity:.3} 50%{opacity:.7} }`}</style>
    </div>
  );
}

function MarketPulse({ articles }: { articles: NewsItemType[] }) {
  const top = articles.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0F1A0F 0%, #111111 100%)",
        border: "1px solid #1E2A1E",
        borderLeft: "3px solid #00FF41",
        borderRadius: 8,
        padding: "20px 22px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00FF41",
              boxShadow: "0 0 6px #00FF41",
              animation: "pulseDot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              color: "#00FF41",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Market Pulse
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#3A5A3A",
          }}
        >
          {articles.length} articles tracked
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {top.map((a, i) => (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 10 }}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "#00FF4160",
                flexShrink: 0,
                marginTop: 3,
                minWidth: 14,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  color: "#C8C8C8",
                  lineHeight: 1.5,
                  marginBottom: 3,
                }}
                className="pulse-link"
              >
                {a.title}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 10,
                  color: "#3A5A3A",
                }}
              >
                {a.source}
              </span>
            </div>
          </a>
        ))}
      </div>

      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .pulse-link:hover { color: #00FF41 !important; }
      `}</style>
    </div>
  );
}

export function NewsFeed({ company }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/news?company=${encodeURIComponent(company)}`);
        if (!res.ok) throw new Error("Failed");
        const data: NewsItemType[] = await res.json();
        if (!cancelled) setArticles(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [company]);

  return (
    <div>
      {loading && <NewsSkeleton />}

      {!loading && error && (
        <div style={{ padding: "20px 0", fontFamily: "var(--font-inter)", fontSize: 13, color: "#4A4A4A", textAlign: "center" }}>
          Unable to load news.
        </div>
      )}

      {!loading && !error && (
        <>
          <MarketPulse articles={articles} />

          {articles.length === 0 ? (
            <div style={{ padding: "20px 0", fontFamily: "var(--font-inter)", fontSize: 13, color: "#4A4A4A", textAlign: "center" }}>
              No recent news found.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 10,
                    color: "#4A4A4A",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  All Coverage
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 10,
                    color: "#3A3A3A",
                  }}
                >
                  // {articles.length} articles
                </span>
              </div>
              {articles.map((article, i) => (
                <NewsItem key={i} item={article} index={i} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
