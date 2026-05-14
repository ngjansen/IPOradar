"use client";

import { colors, fonts } from "@/lib/theme";

type ViewMode = "grid" | "list" | "calendar";
type SortKey = "date" | "hype" | "size";
type Density = "comfortable" | "compact";

interface FilterBarProps {
  sectors: string[];
  activeSector: string;
  onSector: (s: string) => void;
  search: string;
  onSearch: (q: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  density: Density;
  onDensity: (d: Density) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
}

const VIEW_ICONS: { k: ViewMode; title: string; icon: React.ReactNode }[] = [
  {
    k: "grid",
    title: "Grid view",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <rect x="1" y="1" width="5" height="5" rx="1" />
        <rect x="8" y="1" width="5" height="5" rx="1" />
        <rect x="1" y="8" width="5" height="5" rx="1" />
        <rect x="8" y="8" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    k: "list",
    title: "List view",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <rect x="1" y="2" width="12" height="2" rx="1" />
        <rect x="1" y="6" width="12" height="2" rx="1" />
        <rect x="1" y="10" width="12" height="2" rx="1" />
      </svg>
    ),
  },
  {
    k: "calendar",
    title: "Calendar view",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="2" width="12" height="11" rx="1" />
        <line x1="1" y1="5" x2="13" y2="5" />
        <line x1="4" y1="1" x2="4" y2="3" />
        <line x1="10" y1="1" x2="10" y2="3" />
      </svg>
    ),
  },
];

export function FilterBar({ sectors, activeSector, onSector, search, onSearch, sort, onSort, density, onDensity, view, onView }: FilterBarProps) {
  return (
    <div style={{
      position: "sticky",
      top: 56,
      zIndex: 30,
      background: "rgba(10,10,10,0.94)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: `1px solid ${colors.border}`,
      padding: "10px 24px",
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto",
        display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "0 1 260px", minWidth: 180 }}>
          <svg
            width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={colors.textMute} strokeWidth="1.5"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="5.5" cy="5.5" r="4" />
            <line x1="9" y1="9" x2="12" y2="12" />
          </svg>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search ticker, company, sector…"
            style={{
              width: "100%",
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: "7px 10px 7px 30px",
              fontFamily: fonts.ui, fontSize: 12, color: colors.text,
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = colors.accent + "60")}
            onBlur={(e) => (e.currentTarget.style.borderColor = colors.border)}
          />
        </div>

        {/* Sector pills */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["All", ...sectors].map((s) => (
            <button
              key={s}
              onClick={() => onSector(s)}
              style={{
                fontFamily: fonts.ui, fontSize: 11, fontWeight: activeSector === s ? 600 : 500,
                color: activeSector === s ? colors.accent : colors.textMute,
                background: activeSector === s ? colors.accentDim : "transparent",
                border: `1px solid ${activeSector === s ? colors.accent + "50" : colors.border}`,
                borderRadius: 14, padding: "4px 10px", cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sort</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 6, padding: "5px 8px",
              fontFamily: fonts.ui, fontSize: 11, color: colors.text, cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="date">Date (soonest)</option>
            <option value="hype">Hype score</option>
            <option value="size">Offer size</option>
          </select>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", border: `1px solid ${colors.border}`, borderRadius: 6, overflow: "hidden" }}>
          {VIEW_ICONS.map(({ k, title, icon }) => (
            <button
              key={k}
              onClick={() => onView(k)}
              title={title}
              style={{
                background: view === k ? colors.accentDim : colors.surface,
                border: "none",
                padding: "6px 9px", cursor: "pointer",
                color: view === k ? colors.accent : colors.textMute,
                display: "flex", alignItems: "center",
                transition: "all 0.12s",
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Density toggle */}
        <button
          onClick={() => onDensity(density === "comfortable" ? "compact" : "comfortable")}
          title={`Switch to ${density === "comfortable" ? "compact" : "comfortable"} density`}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 6, padding: "6px 10px",
            cursor: "pointer", color: colors.textMute,
            fontFamily: fonts.mono, fontSize: 13,
            transition: "color 0.12s",
          }}
        >
          {density === "comfortable" ? "≡" : "☰"}
        </button>
      </div>
    </div>
  );
}
