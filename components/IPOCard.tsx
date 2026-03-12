"use client";

import Link from "next/link";
import type { IPO } from "@/lib/types";
import { LetterAvatar } from "./LetterAvatar";

interface IPOCardProps {
  ipo: IPO;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function HypeBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score * 5));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: "#222", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #00FF41, #00FF4180)", borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#00FF41", whiteSpace: "nowrap" }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function IPOCard({ ipo }: IPOCardProps) {
  const isFiled = ipo.status === "filed";
  const isPriced = ipo.status === "priced";
  const isCompact = isFiled || isPriced;
  const days = !isCompact && ipo.date ? daysUntil(ipo.date) : -1;
  const isImminent = days >= 0 && days <= 7;

  const borderColor = isFiled ? "#1E1E1E" : isPriced ? "#1E1E1E" : ipo.isTech ? "#00FF4130" : "#222222";

  return (
    <Link
      href={`/ipo/${ipo.symbol}`}
      style={{
        display: "block",
        background: isCompact ? "#111111" : "#141414",
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: isCompact ? "16px 20px" : "20px",
        textDecoration: "none",
        transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
        opacity: isCompact ? 0.75 : 1,
        ...(!isCompact && ipo.isTech ? { borderLeft: "2px solid #00FF41", boxShadow: "-4px 0 16px #00FF4115" } : {}),
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.opacity = "1";
        el.style.transform = "translateY(-2px)";
        el.style.borderColor = isCompact ? "#2a2a2a" : ipo.isTech ? "#00FF4160" : "#333333";
        if (!isCompact) el.style.boxShadow = ipo.isTech ? "-4px 0 16px #00FF4125, 0 8px 24px #00000060" : "0 8px 24px #00000060";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.opacity = isCompact ? "0.75" : "1";
        el.style.transform = "translateY(0)";
        el.style.borderColor = borderColor;
        if (!isCompact) el.style.boxShadow = ipo.isTech ? "-4px 0 16px #00FF4115" : "";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: isCompact ? 12 : 16 }}>
        <LetterAvatar name={ipo.company} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: isCompact ? 14 : 15, color: isCompact ? "#9A9A9A" : "#F0F0F0", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ipo.company}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: isCompact ? "#4A4A4A" : "#00FF41", fontWeight: 600 }}>
              ${ipo.symbol}
            </span>
            {ipo.exchange && (
              <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", background: "#1A1A1A", border: "1px solid #222", borderRadius: 4, padding: "1px 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {ipo.exchange.replace("NASDAQ Global Select", "NASDAQ").replace("NASDAQ Global", "NASDAQ").replace("NYSE American", "NYSE").substring(0, 12)}
              </span>
            )}
          </div>
        </div>

        {/* Status / sector badge */}
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 500, color: isCompact ? "#3A3A3A" : ipo.isTech ? "#00FF41" : "#6A6A6A", background: isCompact ? "#1A1A1A" : ipo.isTech ? "#00FF4110" : "#1A1A1A", border: `1px solid ${isCompact ? "#222" : ipo.isTech ? "#00FF4130" : "#2a2a2a"}`, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>
          {ipo.sector}
        </span>
      </div>

      {/* Filed card: compact view */}
      {isFiled ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
              Filed
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
              {ipo.filedDate ? formatDate(ipo.filedDate) : "—"}
            </div>
          </div>
          {ipo.offerAmount && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                Offer Size
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#6A6A6A" }}>
                {ipo.offerAmount}
              </div>
            </div>
          )}
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#2A2A2A", background: "#1A1A1A", border: "1px solid #222", borderRadius: 4, padding: "3px 8px" }}>
            Date TBD
          </div>
        </div>
      ) : isPriced ? (
        /* Priced card: compact, muted */
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
              Priced At
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#6A6A6A" }}>
              {ipo.priceRange !== "TBD" ? ipo.priceRange : "—"}
            </div>
          </div>
          {ipo.pricedDate && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                Date
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#4A4A4A" }}>
                {formatDate(ipo.pricedDate)}
              </div>
            </div>
          )}
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#2A2A2A", background: "#1A1A1A", border: "1px solid #222", borderRadius: 4, padding: "3px 8px" }}>
            Priced ✓
          </div>
        </div>
      ) : (
        /* Upcoming card: full view */
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                Expected Date
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: isImminent ? "#00FF41" : "#9A9A9A", fontWeight: isImminent ? 600 : 400 }}>
                {ipo.date ? formatDate(ipo.date) : "TBD"}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                Price Range
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "#F0F0F0" }}>
                {ipo.priceRange}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "flex", justifyContent: "space-between" }}>
              <span>Hype Score</span>
              {ipo.newsCount > 0 && <span style={{ color: "#4A4A4A" }}>{ipo.newsCount} articles</span>}
            </div>
            <HypeBar score={ipo.hypeScore} />
          </div>

          {days >= 0 && (
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: isImminent ? "#00FF41" : "#3A3A3A", textAlign: "right" }}>
              {days === 0 ? "Today" : `in ${days} day${days === 1 ? "" : "s"}`}
            </div>
          )}
        </>
      )}
    </Link>
  );
}
