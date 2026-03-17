"use client";

import Link from "next/link";
import type { IPO } from "@/lib/types";
import { LetterAvatar } from "./LetterAvatar";

interface RecentIPOCardProps {
  ipo: IPO;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function PerfBar({ pct }: { pct: number }) {
  const clamped = Math.max(-100, Math.min(100, pct));
  const isPositive = pct >= 0;
  const color = isPositive ? "#00FF41" : "#FF4444";
  const glow = isPositive ? "0 0 6px #00FF4160" : "0 0 6px #FF444460";
  const width = Math.abs(clamped) / 2; // half because bar fills from center

  return (
    <div
      style={{
        position: "relative",
        height: 3,
        background: "#1A1A1A",
        marginBottom: 14,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          height: "100%",
          width: `${width}%`,
          background: color,
          boxShadow: glow,
          borderRadius: 2,
          ...(isPositive ? { left: "50%" } : { right: "50%" }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: 1,
          height: "100%",
          background: "#2A2A2A",
        }}
      />
    </div>
  );
}

function PerfHero({ pct }: { pct: number }) {
  const isPositive = pct >= 0;
  const color = isPositive ? "#00FF41" : "#FF4444";
  const bg = isPositive ? "#00FF4115" : "#FF444415";
  const border = isPositive ? "#00FF4150" : "#FF444450";
  const sign = isPositive ? "+" : "";

  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 22,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: "6px 14px",
        whiteSpace: "nowrap",
        flexShrink: 0,
        letterSpacing: "-0.02em",
        boxShadow: isPositive ? "0 0 12px #00FF4120" : "0 0 12px #FF444420",
      }}
    >
      {sign}{pct.toFixed(1)}%
    </span>
  );
}

export function RecentIPOCard({ ipo }: RecentIPOCardProps) {
  const hasQuote = typeof ipo.currentPrice === "number" && typeof ipo.perfPct === "number";
  const isWinner = hasQuote && ipo.perfPct! >= 0;
  const isLoser = hasQuote && ipo.perfPct! < 0;

  // Color identity
  const cardBg = isWinner
    ? "linear-gradient(135deg, #0C1A0E 0%, #0F1A10 100%)"
    : isLoser
    ? "linear-gradient(135deg, #1A0C0C 0%, #1A0F0F 100%)"
    : "#111111";
  const borderColor = isWinner ? "#00FF4130" : isLoser ? "#FF444430" : "#1A1A1A";
  const leftBorderColor = isWinner ? "#00FF41" : isLoser ? "#FF4444" : "transparent";

  const hoverGlow = isWinner
    ? "0 8px 32px #00FF4120"
    : isLoser
    ? "0 8px 32px #FF444420"
    : "0 8px 24px #00000060";

  return (
    <Link
      href={`/ipo/${ipo.symbol}`}
      style={{
        display: "block",
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${leftBorderColor}`,
        borderRadius: 12,
        padding: "20px",
        textDecoration: "none",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = hoverGlow;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "";
      }}
    >
      {/* Zone 1: Avatar + Company Name + Hero Perf Pill */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
        <LetterAvatar name={ipo.company} size="sm" />
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
            {ipo.company}
          </div>
        </div>
        {hasQuote && <PerfHero pct={ipo.perfPct!} />}
      </div>

      {/* Zone 2: Metadata row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 16, paddingLeft: 44 }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 12,
            color: "#00FF41",
            fontWeight: 600,
          }}
        >
          ${ipo.symbol}
        </span>
        {ipo.exchange && (
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 10,
              color: "#3A3A3A",
              background: "#1A1A1A",
              border: "1px solid #222",
              borderRadius: 4,
              padding: "1px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {ipo.exchange
              .replace("NASDAQ Global Select", "NASDAQ")
              .replace("NASDAQ Global", "NASDAQ")
              .replace("NYSE American", "NYSE")
              .substring(0, 12)}
          </span>
        )}
        {ipo.sector && (
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 10,
              color: "#6A6A6A",
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              borderRadius: 4,
              padding: "1px 6px",
            }}
          >
            {ipo.sector}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #1E1E1E", marginBottom: 14 }} />

      {/* Zone 3: Prices (flat, no box) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 9,
              color: "#3A3A3A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 2,
            }}
          >
            IPO Price
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 13,
              color: "#9A9A9A",
              fontWeight: 600,
            }}
          >
            {ipo.ipoPrice ? formatPrice(ipo.ipoPrice) : ipo.priceRange !== "TBD" ? ipo.priceRange : "—"}
          </div>
        </div>

        <div style={{ color: "#2A2A2A", fontSize: 14 }}>→</div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 9,
              color: "#3A3A3A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 2,
            }}
          >
            Current
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 13,
              color: hasQuote ? "#F0F0F0" : "#2A2A2A",
              fontWeight: 600,
            }}
          >
            {hasQuote ? formatPrice(ipo.currentPrice!) : "—"}
          </div>
        </div>
      </div>

      {/* Perf bar / divider */}
      {hasQuote ? (
        <PerfBar pct={ipo.perfPct!} />
      ) : (
        <div style={{ borderTop: "1px solid #1E1E1E", marginBottom: 14 }} />
      )}

      {/* Zone 4: Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            color: "#6A6A6A",
          }}
        >
          {formatDate(ipo.pricedDate)}
        </div>

        {ipo.offerAmount && (
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              color: "#6A6A6A",
            }}
          >
            {ipo.offerAmount}
          </div>
        )}
      </div>
    </Link>
  );
}
