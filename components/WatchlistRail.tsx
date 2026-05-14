"use client";

import type { IPO } from "@/lib/types";
import { colors, fonts } from "@/lib/theme";
import { LetterAvatar } from "./LetterAvatar";

interface WatchlistRailProps {
  watchlist: Set<string>;
  ipos: IPO[];
  onRemove: (symbol: string) => void;
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - today.getTime()) / 86400000);
}

export function WatchlistRail({ watchlist, ipos, onRemove }: WatchlistRailProps) {
  const items = Array.from(watchlist)
    .map((sym) => ipos.find((i) => i.symbol === sym))
    .filter((i): i is IPO => !!i);

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      alignSelf: "flex-start",
      position: "sticky",
      top: 110,
    }}>
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "12px 14px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill={colors.accent} stroke={colors.accent} strokeWidth="0">
            <path d="M6.5 1l1.7 3.4 3.8.5-2.7 2.7.6 3.8-3.4-1.8-3.4 1.8.6-3.8L1 4.9l3.8-.5z" />
          </svg>
          <span style={{ fontFamily: fonts.display, fontSize: 13, fontWeight: 700, color: colors.text, letterSpacing: "-0.01em" }}>
            Watchlist
          </span>
          <span style={{
            fontFamily: fonts.mono, fontSize: 10, fontWeight: 600,
            color: colors.accent, background: colors.accentDim,
            borderRadius: 8, padding: "1px 7px", marginLeft: "auto",
          }}>{items.length}</span>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div style={{ padding: "24px 14px", textAlign: "center" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={colors.textMute} strokeWidth="1.5" style={{ margin: "0 auto 10px" }}>
              <path d="M14 2l3.7 7.4 8.3 1.2-6 5.8 1.4 8.2L14 20.8 6.6 24.6 8 16.4 2 10.6l8.3-1.2z" />
            </svg>
            <div style={{ fontFamily: fonts.ui, fontSize: 11, color: colors.textMute, lineHeight: 1.5 }}>
              Star any IPO to track it here
            </div>
          </div>
        )}

        {/* Items */}
        {items.map((ipo) => {
          const days = ipo.date ? daysUntil(ipo.date) : null;
          const daysLabel =
            days === null ? "TBD" :
            days === 0 ? "TODAY" :
            days === 1 ? "TOMORROW" :
            days > 0 ? `in ${days}d` : "Past";

          return (
            <div key={ipo.symbol} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px",
              borderBottom: `1px solid ${colors.border}`,
              animation: "slideIn 0.2s ease both",
            }}>
              <LetterAvatar name={ipo.company} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 12, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ipo.company}
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accent }}>
                  ${ipo.symbol} · <span style={{ color: days !== null && days >= 0 && days <= 7 ? colors.accent : colors.textMute }}>{daysLabel}</span>
                </div>
              </div>
              <button
                onClick={() => onRemove(ipo.symbol)}
                style={{
                  background: "transparent", border: "none",
                  color: colors.textMute, cursor: "pointer",
                  fontSize: 16, lineHeight: 1, padding: "2px 4px",
                  borderRadius: 4, flexShrink: 0,
                }}
              >×</button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
