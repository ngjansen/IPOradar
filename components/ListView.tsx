"use client";

import { useState } from "react";
import Link from "next/link";
import type { IPO } from "@/lib/types";
import { colors, fonts } from "@/lib/theme";
import { LetterAvatar } from "./LetterAvatar";
import { HypeMeter } from "./HypeMeter";

interface ListViewProps {
  ipos: IPO[];
  watched: Set<string>;
  onWatch: (symbol: string) => void;
  compared: Set<string>;
  onCompare: (symbol: string) => void;
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - today.getTime()) / 86400000);
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function IconBtn({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 26, height: 26,
        background: active ? colors.accentDim : "transparent",
        border: `1px solid ${active ? colors.accent + "60" : "transparent"}`,
        borderRadius: 5, cursor: "pointer",
        color: active ? colors.accent : colors.textMute,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

const COL = "28px 1.6fr 90px 120px 110px 100px 1fr 80px";

export function ListView({ ipos, watched, onWatch, compared, onCompare }: ListViewProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 10, overflow: "hidden" }}>
      {/* Header row */}
      <div style={{
        display: "grid", gridTemplateColumns: COL,
        padding: "10px 16px", gap: 12,
        borderBottom: `1px solid ${colors.border}`,
        fontFamily: fonts.mono, fontSize: 9, color: colors.textFaint,
        textTransform: "uppercase", letterSpacing: "0.1em",
      }}>
        <div />
        <div>Company</div>
        <div>Date</div>
        <div>Range</div>
        <div>Raise</div>
        <div>Sector</div>
        <div>Hype · 7d</div>
        <div style={{ textAlign: "right" }}>Actions</div>
      </div>

      {/* Data rows */}
      {ipos.map((ipo, idx) => {
        const days = ipo.date ? daysUntil(ipo.date) : -1;
        const isImminent = days >= 0 && days <= 7;
        const isFiled = ipo.status === "filed";

        return (
          <div
            key={ipo.symbol}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: "grid", gridTemplateColumns: COL,
              padding: "11px 16px", gap: 12, alignItems: "center",
              borderBottom: `1px solid ${colors.border}`,
              background: hoveredIdx === idx ? colors.surfaceHi : "transparent",
              transition: "background 0.12s",
            }}
          >
            <LetterAvatar name={ipo.company} size="sm" />

            <div>
              <Link href={`/ipo/${ipo.symbol}`} style={{ textDecoration: "none" }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 13, color: colors.text }}>{ipo.company}</div>
              </Link>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accent }}>${ipo.symbol} · {ipo.exchange?.replace("NASDAQ Global Select", "NASDAQ").replace("NYSE American", "NYSE").substring(0, 8)}</div>
            </div>

            <div>
              {isFiled ? (
                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textMute, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, padding: "2px 6px" }}>TBD</span>
              ) : (
                <>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: isImminent ? colors.accent : colors.text, fontWeight: isImminent ? 700 : 500 }}>
                    {days >= 0 ? `${days}d` : "—"}
                  </div>
                  {ipo.date && <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textMute }}>{fmtDate(ipo.date)}</div>}
                </>
              )}
            </div>

            <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.text }}>
              {ipo.priceRange?.replace(/\.00/g, "").replace(" – ", "–") ?? "TBD"}
            </div>

            <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.text }}>
              {ipo.offerAmount ?? "—"}
            </div>

            <div style={{ fontFamily: fonts.ui, fontSize: 11, color: colors.textDim }}>
              {ipo.sector}
            </div>

            <div>
              {!isFiled && ipo.hypeScore != null && (
                <HypeMeter score={ipo.hypeScore} newsCount={ipo.newsCount ?? 0} />
              )}
            </div>

            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
              <IconBtn active={watched.has(ipo.symbol)} onClick={(e) => { e.stopPropagation(); onWatch(ipo.symbol); }}>
                <svg width="13" height="13" viewBox="0 0 13 13"
                  fill={watched.has(ipo.symbol) ? colors.accent : "none"}
                  stroke="currentColor" strokeWidth="1.4"
                >
                  <path d="M6.5 1l1.7 3.4 3.8.5-2.7 2.7.6 3.8-3.4-1.8-3.4 1.8.6-3.8L1 4.9l3.8-.5z" />
                </svg>
              </IconBtn>
              <IconBtn active={compared.has(ipo.symbol)} onClick={(e) => { e.stopPropagation(); onCompare(ipo.symbol); }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="1" y="2" width="4" height="9" rx="0.5" />
                  <rect x="8" y="2" width="4" height="9" rx="0.5" />
                </svg>
              </IconBtn>
            </div>
          </div>
        );
      })}

      {ipos.length === 0 && (
        <div style={{ padding: "48px 0", textAlign: "center", fontFamily: fonts.ui, fontSize: 13, color: colors.textMute }}>
          No IPOs match your filters.
        </div>
      )}
    </div>
  );
}
