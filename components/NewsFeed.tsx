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
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            padding: "14px 0",
            borderBottom: "1px solid #1E1E1E",
          }}
        >
          <div
            style={{
              height: 14,
              background: "#1A1A1A",
              borderRadius: 4,
              marginBottom: 8,
              width: `${75 + Math.random() * 20}%`,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 11,
              background: "#1A1A1A",
              borderRadius: 4,
              width: "40%",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
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
        if (!res.ok) throw new Error("Failed to fetch news");
        const data: NewsItemType[] = await res.json();
        if (!cancelled) {
          setArticles(data);
        }
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: 16,
            fontWeight: 700,
            color: "#F0F0F0",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Latest News
        </h2>
        {!loading && !error && (
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              color: "#4A4A4A",
            }}
          >
            {articles.length} articles
          </span>
        )}
      </div>

      {loading && <NewsSkeleton />}

      {!loading && error && (
        <div
          style={{
            padding: "20px 0",
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            color: "#4A4A4A",
            textAlign: "center",
          }}
        >
          Unable to load news at this time.
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div
          style={{
            padding: "20px 0",
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            color: "#4A4A4A",
            textAlign: "center",
          }}
        >
          No recent news found for this company.
        </div>
      )}

      {!loading && !error && articles.map((article, i) => (
        <NewsItem key={i} item={article} />
      ))}
    </div>
  );
}
