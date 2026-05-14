"use client";

import type { IPO } from "@/lib/types";
import { colors, fonts } from "@/lib/theme";
import { LetterAvatar } from "./LetterAvatar";

interface CompareDrawerProps {
  symbols: string[];
  ipos: IPO[];
  onClose: () => void;
  onRemove: (symbol: string) => void;
}

export function CompareDrawer({ symbols, ipos, onClose, onRemove }: CompareDrawerProps) {
  if (!symbols.length) return null;

  const items = symbols
    .map((s) => ipos.find((i) => i.symbol === s))
    .filter((i): i is IPO => !!i);

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60,
      background: "rgba(10,10,10,0.96)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderTop: `1px solid ${colors.accent}40`,
      boxShadow: `0 -8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${colors.accent}15 inset`,
      animation: "fadeInUp 0.25s ease both",
    }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "14px 24px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accent, letterSpacing: "0.15em" }}>// COMPARE</span>
            <span style={{ fontFamily: fonts.display, fontSize: 13, fontWeight: 600, color: colors.text }}>
              {items.length} IPO{items.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              background: colors.accent, border: "none", color: "#000",
              fontFamily: fonts.ui, fontSize: 12, fontWeight: 700,
              padding: "6px 14px", borderRadius: 6, cursor: "pointer",
            }}>
              Open full compare →
            </button>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: `1px solid ${colors.borderHi}`,
                color: colors.textMute,
                fontFamily: fonts.ui, fontSize: 12,
                padding: "6px 12px", borderRadius: 6, cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* IPO chips */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
          gap: 10,
        }}>
          {items.map((ipo) => (
            <div key={ipo.symbol} style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 8, padding: "10px 12px",
              display: "flex", alignItems: "center", gap: 10,
              animation: "slideIn 0.2s ease both",
            }}>
              <LetterAvatar name={ipo.company} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 12, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ipo.company}
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accent }}>
                  ${ipo.symbol} · {ipo.offerAmount ?? "—"}
                </div>
              </div>
              <button
                onClick={() => onRemove(ipo.symbol)}
                style={{
                  background: "transparent", border: "none",
                  color: colors.textMute, cursor: "pointer",
                  fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0,
                }}
              >×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
