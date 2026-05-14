"use client";

import { useState } from "react";
import Link from "next/link";
import type { IPO } from "@/lib/types";
import { colors, fonts } from "@/lib/theme";
import { LetterAvatar } from "./LetterAvatar";
import { HypeMeter } from "./HypeMeter";

interface IPOCardV2Props {
  ipo: IPO;
  watched: boolean;
  onWatch: (symbol: string) => void;
  compared: boolean;
  onCompare: (symbol: string) => void;
  density?: "comfortable" | "compact";
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - today.getTime()) / 86400000);
}

function fmtDateLong(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textFaint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{children}</div>;
}

function Value({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return <div style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: highlight ? colors.accent : colors.text, letterSpacing: "-0.01em" }}>{children}</div>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: fonts.ui, fontSize: 10, color: colors.textFaint, marginTop: 1 }}>{children}</div>;
}

function IconBtn({ children, active, onClick, title }: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 26, height: 26,
        background: active ? colors.accentDim : hovered ? colors.surfaceHi : "transparent",
        border: `1px solid ${active ? colors.accent + "60" : hovered ? colors.borderHi : "transparent"}`,
        borderRadius: 5, cursor: "pointer",
        color: active ? colors.accent : colors.textMute,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.12s",
      }}
    >
      {children}
    </button>
  );
}

export function IPOCardV2({ ipo, watched, onWatch, compared, onCompare, density = "comfortable" }: IPOCardV2Props) {
  const [hover, setHover] = useState(false);

  const isFiled = ipo.status === "filed";
  const days = !isFiled && ipo.date ? daysUntil(ipo.date) : -999;
  const isImminent = days >= 0 && days <= 7;
  const isToday = days === 0;
  const compact = density === "compact";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: hover ? colors.surfaceHi : colors.surface,
        border: `1px solid ${isImminent && !isFiled ? colors.accent + "40" : colors.border}`,
        borderRadius: 10,
        padding: compact ? "12px 14px" : "16px 18px",
        transition: "all 0.15s ease",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hover
          ? `0 8px 24px rgba(0,0,0,0.4)${isImminent ? `, 0 0 0 1px ${colors.accent}30` : ""}`
          : "none",
      }}
    >
      {/* Top gradient strip for imminent */}
      {isImminent && !isFiled && (
        <div style={{
          position: "absolute", top: -1, left: 16, right: 16, height: 2,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}40)`,
          borderRadius: "0 0 2px 2px",
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: compact ? 10 : 14 }}>
        <Link href={`/ipo/${ipo.symbol}`} style={{ textDecoration: "none", display: "contents" }}>
          <LetterAvatar name={ipo.company} size={compact ? "sm" : "sm"} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/ipo/${ipo.symbol}`} style={{ textDecoration: "none" }}>
            <div style={{
              fontFamily: fonts.display, fontWeight: 700,
              fontSize: compact ? 13 : 15, color: colors.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}>{ipo.company}</div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 11, color: isImminent ? colors.accent : colors.textDim, fontWeight: 600 }}>${ipo.symbol}</span>
            <span style={{ color: colors.textFaint, fontSize: 10 }}>·</span>
            <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textMute }}>{ipo.exchange?.replace("NASDAQ Global Select", "NASDAQ").replace("NASDAQ Global", "NASDAQ").replace("NYSE American", "NYSE").substring(0, 8)}</span>
            <span style={{ color: colors.textFaint, fontSize: 10 }}>·</span>
            <span style={{ fontFamily: fonts.ui, fontSize: 10, color: colors.textMute }}>{ipo.sector}</span>
          </div>
        </div>

        {/* Action icons — show on hover or when active */}
        <div style={{
          display: "flex", gap: 4,
          opacity: hover || watched || compared ? 1 : 0.3,
          transition: "opacity 0.15s",
        }}>
          <IconBtn
            active={watched}
            onClick={(e) => { e.stopPropagation(); onWatch(ipo.symbol); }}
            title="Add to watchlist"
          >
            <svg width="13" height="13" viewBox="0 0 13 13"
              fill={watched ? colors.accent : "none"}
              stroke={watched ? colors.accent : "currentColor"}
              strokeWidth="1.4"
            >
              <path d="M6.5 1l1.7 3.4 3.8.5-2.7 2.7.6 3.8-3.4-1.8-3.4 1.8.6-3.8L1 4.9l3.8-.5z" />
            </svg>
          </IconBtn>
          <IconBtn
            active={compared}
            onClick={(e) => { e.stopPropagation(); onCompare(ipo.symbol); }}
            title="Compare"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="1" y="2" width="4" height="9" rx="0.5" />
              <rect x="8" y="2" width="4" height="9" rx="0.5" />
            </svg>
          </IconBtn>
        </div>
      </div>

      {/* Filed view — compact */}
      {isFiled ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <Label>S-1 Filed</Label>
            <Value>{ipo.filedDate ? fmtDateLong(ipo.filedDate) : "—"}</Value>
          </div>
          {ipo.offerAmount && (
            <div style={{ textAlign: "right" }}>
              <Label>Target Raise</Label>
              <Value>{ipo.offerAmount}</Value>
            </div>
          )}
          <span style={{
            fontFamily: fonts.mono, fontSize: 9, color: colors.textMute,
            background: colors.bg, border: `1px solid ${colors.border}`,
            borderRadius: 4, padding: "3px 7px", letterSpacing: "0.08em",
            flexShrink: 0,
          }}>DATE TBD</span>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: compact ? 10 : 12 }}>
            <div>
              <Label>Date</Label>
              <Value highlight={isImminent}>
                {isToday ? "TODAY" : days === 1 ? "TOMORROW" : days > 0 && days <= 7 ? `IN ${days}D` : ipo.date ? fmtDate(ipo.date) : "TBD"}
              </Value>
              {isImminent && ipo.date && <Sub>{fmtDate(ipo.date)}</Sub>}
            </div>
            <div>
              <Label>Range</Label>
              <Value>{ipo.priceRange?.replace(/\.00/g, "").replace(" – ", "–") ?? "TBD"}</Value>
              <Sub>per share</Sub>
            </div>
            <div>
              <Label>Raise</Label>
              <Value>{ipo.offerAmount ?? "—"}</Value>
              <Sub>target</Sub>
            </div>
          </div>

          {/* Hype meter */}
          <HypeMeter score={ipo.hypeScore ?? 0} newsCount={ipo.newsCount ?? 0} />
        </>
      )}
    </div>
  );
}
