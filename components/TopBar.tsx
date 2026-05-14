"use client";

import { colors, fonts } from "@/lib/theme";

type TabId = "upcoming" | "recent" | "speculation";

interface TopBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  watchlistCount: number;
  compareCount: number;
  onOpenCompare: () => void;
}

function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="10" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.3" />
        <circle cx="11" cy="11" r="6"  fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.5" />
        <circle cx="11" cy="11" r="2"  fill={colors.accent} />
        <line x1="11" y1="11" x2="20" y2="4" stroke={colors.accent} strokeWidth="1.2" />
      </svg>
      <span style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text, letterSpacing: "-0.04em" }}>
        IPO<span style={{ color: colors.accent }}>radar</span>
      </span>
    </div>
  );
}

const NAV_TABS: { id: TabId; label: string }[] = [
  { id: "upcoming",    label: "Upcoming" },
  { id: "recent",      label: "Recent" },
  { id: "speculation", label: "Speculation" },
];

export function TopBar({ activeTab, setActiveTab, watchlistCount, compareCount, onOpenCompare }: TopBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York", hour12: false });

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(10,10,10,0.88)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center", gap: 8, height: 56,
      }}>
        <BrandMark />

        {/* Tab nav */}
        <nav style={{ display: "flex", gap: 2, marginLeft: 16 }}>
          {NAV_TABS.map(({ id, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? `2px solid ${colors.accent}` : "2px solid transparent",
                  fontFamily: fonts.ui,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? colors.text : colors.textMute,
                  padding: "0 12px",
                  height: 56,
                  cursor: "pointer",
                  transition: "color 0.12s, border-color 0.12s",
                  letterSpacing: "-0.01em",
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: fonts.mono, fontSize: 11, color: colors.textMute }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: colors.accent,
            boxShadow: `0 0 6px ${colors.accent}`,
            animation: "blink 2s ease-in-out infinite",
            display: "inline-block",
          }} />
          LIVE · {timeStr} ET
        </div>

        {/* Compare button */}
        <button
          onClick={onOpenCompare}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: compareCount > 0 ? colors.accentDim : colors.surface,
            border: `1px solid ${compareCount > 0 ? colors.accent + "60" : colors.borderHi}`,
            color: compareCount > 0 ? colors.accent : colors.textDim,
            fontFamily: fonts.ui, fontSize: 12, fontWeight: 500,
            padding: "6px 12px", borderRadius: 6, cursor: "pointer",
            transition: "all 0.12s",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="2" width="4" height="9" rx="0.5" />
            <rect x="8" y="2" width="4" height="9" rx="0.5" />
          </svg>
          Compare{compareCount > 0 ? ` (${compareCount})` : ""}
        </button>

        {/* Watchlist button */}
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: colors.surface,
            border: `1px solid ${colors.borderHi}`,
            color: colors.textDim,
            fontFamily: fonts.ui, fontSize: 12, fontWeight: 500,
            padding: "6px 12px", borderRadius: 6, cursor: "pointer",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13"
            fill={watchlistCount > 0 ? colors.accent : "none"}
            stroke={watchlistCount > 0 ? colors.accent : "currentColor"}
            strokeWidth="1.5"
          >
            <path d="M6.5 1l1.7 3.4 3.8.5-2.7 2.7.6 3.8-3.4-1.8-3.4 1.8.6-3.8L1 4.9l3.8-.5z" />
          </svg>
          Watchlist{watchlistCount > 0 ? ` (${watchlistCount})` : ""}
        </button>

        {/* Get alerts CTA */}
        <button style={{
          background: colors.accent, border: "none", color: "#000",
          fontFamily: fonts.ui, fontSize: 12, fontWeight: 700,
          padding: "7px 14px", borderRadius: 6, cursor: "pointer",
          letterSpacing: "-0.01em",
        }}>
          Get alerts
        </button>
      </div>
    </div>
  );
}
