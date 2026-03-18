"use client";

import type { NewsItem as NewsItemType } from "@/lib/types";

interface NewsItemProps {
  item: NewsItemType;
  index?: number;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NewsItem({ item, index = 0 }: NewsItemProps) {
  const isFirst = index === 0;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        padding: isFirst ? "0 0 20px 0" : "18px 0",
        borderBottom: "1px solid #1A1A1A",
        textDecoration: "none",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
    >
      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: isFirst ? 16 : 14,
          fontWeight: isFirst ? 600 : 500,
          color: "#E8E8E8",
          lineHeight: 1.5,
          marginBottom: 8,
        }}
      >
        {item.title}
      </div>

      {item.snippet && (
        <div
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            color: "#5A5A5A",
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          {item.snippet}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#00FF41",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {item.source}
        </span>
        <span style={{ color: "#2A2A2A", fontSize: 10 }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#4A4A4A",
          }}
        >
          {relativeTime(item.publishedAt)}
        </span>
        <span style={{ color: "#2A2A2A", fontSize: 10 }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#3A3A3A",
          }}
        >
          ↗ Read
        </span>
      </div>
    </a>
  );
}
