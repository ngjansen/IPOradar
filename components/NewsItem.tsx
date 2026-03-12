import type { NewsItem as NewsItemType } from "@/lib/types";

interface NewsItemProps {
  item: NewsItemType;
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

export function NewsItem({ item }: NewsItemProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        padding: "14px 0",
        borderBottom: "1px solid #1E1E1E",
        textDecoration: "none",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
    >
      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 13,
          fontWeight: 500,
          color: "#E0E0E0",
          lineHeight: 1.5,
          marginBottom: 6,
        }}
      >
        {item.title}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 11,
            color: "#00FF41",
            fontWeight: 500,
          }}
        >
          {item.source}
        </span>
        <span style={{ color: "#2A2A2A", fontSize: 10 }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            color: "#4A4A4A",
          }}
        >
          {relativeTime(item.publishedAt)}
        </span>
      </div>
    </a>
  );
}
