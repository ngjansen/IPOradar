"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { IPO } from "@/lib/types";
import { RecentIPOCard } from "./RecentIPOCard";
import { LetterAvatar } from "./LetterAvatar";

type SortKey = "newest" | "best" | "worst" | "largest";
type ViewMode = "grid" | "list";

interface RecentIPOsClientProps {
  ipos: IPO[];
}

function parseOfferAmount(raw: string): number {
  if (!raw) return 0;
  const s = raw.replace("$", "").trim();
  if (s.endsWith("B")) return parseFloat(s) * 1e9;
  if (s.endsWith("M")) return parseFloat(s) * 1e6;
  return parseFloat(s.replace(/,/g, "")) || 0;
}

function getWeekLabel(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const today = new Date();
  const todayDay = today.getDay();
  const todayDiff = todayDay === 0 ? -6 : 1 - todayDay;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + todayDiff);
  thisMonday.setHours(0, 0, 0, 0);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  if (monday.getTime() === thisMonday.getTime()) return "This Week";
  if (monday.getTime() === lastMonday.getTime()) return "Last Week";

  return (
    monday.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " week"
  );
}

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "best", label: "Best Performer" },
  { key: "worst", label: "Worst Performer" },
  { key: "largest", label: "Largest Raise" },
];

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="1" y="2" width="12" height="2" rx="1" />
      <rect x="1" y="6" width="12" height="2" rx="1" />
      <rect x="1" y="10" width="12" height="2" rx="1" />
    </svg>
  );
}

function RecentIPORow({ ipo }: { ipo: IPO }) {
  const hasQuote =
    typeof ipo.currentPrice === "number" && typeof ipo.perfPct === "number";
  const isWinner = hasQuote && ipo.perfPct! >= 0;
  const isLoser = hasQuote && ipo.perfPct! < 0;

  const leftBorderColor = isWinner
    ? "#00FF4140"
    : isLoser
    ? "#FF444440"
    : "transparent";
  const perfColor = isWinner ? "#00FF41" : isLoser ? "#FF4444" : "#6A6A6A";
  const sign = hasQuote && ipo.perfPct! >= 0 ? "+" : "";

  const dateStr = ipo.pricedDate
    ? new Date(ipo.pricedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <Link
      href={`/ipo/${ipo.symbol}`}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 90px 80px 80px 80px",
        alignItems: "center",
        padding: "10px 16px",
        gap: 8,
        borderBottom: "1px solid #1A1A1A",
        borderLeft: `3px solid ${leftBorderColor}`,
        textDecoration: "none",
        transition: "background 0.1s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#161616";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <LetterAvatar name={ipo.company} size="sm" />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 600,
            fontSize: 13,
            color: "#F0F0F0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {ipo.company}
        </div>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            color: "#00FF41",
          }}
        >
          ${ipo.symbol}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 12,
          color: "#9A9A9A",
          textAlign: "right",
        }}
      >
        {ipo.ipoPrice ? `$${ipo.ipoPrice.toFixed(2)}` : "—"}
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 12,
          color: hasQuote ? "#F0F0F0" : "#2A2A2A",
          textAlign: "right",
        }}
      >
        {hasQuote ? `$${ipo.currentPrice!.toFixed(2)}` : "—"}
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 12,
          fontWeight: 700,
          color: perfColor,
          textAlign: "right",
        }}
      >
        {hasQuote ? `${sign}${ipo.perfPct!.toFixed(1)}%` : "—"}
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 11,
          color: "#6A6A6A",
          textAlign: "right",
        }}
      >
        {dateStr}
      </div>
    </Link>
  );
}

export function RecentIPOsClient({ ipos }: RecentIPOsClientProps) {
  const [sort, setSort] = useState<SortKey>("newest");
  const [activeSector, setActiveSector] = useState<string>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const sectors = useMemo(
    () =>
      Array.from(new Set(ipos.map((i) => i.sector).filter(Boolean))).sort() as string[],
    [ipos]
  );

  const quotedCount = useMemo(
    () => ipos.filter((i) => typeof i.perfPct === "number").length,
    [ipos]
  );

  const filtered = useMemo(() => {
    let result = [...ipos];

    if (activeSector !== "All") {
      result = result.filter((i) => i.sector === activeSector);
    }

    if (sort === "newest") {
      result.sort((a, b) => {
        if (!a.pricedDate) return 1;
        if (!b.pricedDate) return -1;
        return b.pricedDate.localeCompare(a.pricedDate);
      });
    } else if (sort === "best") {
      result.sort((a, b) => {
        const aHas = typeof a.perfPct === "number";
        const bHas = typeof b.perfPct === "number";
        if (!aHas && !bHas) return 0;
        if (!aHas) return 1;
        if (!bHas) return -1;
        return b.perfPct! - a.perfPct!;
      });
    } else if (sort === "worst") {
      result.sort((a, b) => {
        const aHas = typeof a.perfPct === "number";
        const bHas = typeof b.perfPct === "number";
        if (!aHas && !bHas) return 0;
        if (!aHas) return 1;
        if (!bHas) return -1;
        return a.perfPct! - b.perfPct!;
      });
    } else if (sort === "largest") {
      result.sort(
        (a, b) =>
          parseOfferAmount(b.offerAmount) - parseOfferAmount(a.offerAmount)
      );
    }

    return result;
  }, [ipos, sort, activeSector]);

  const grouped = useMemo(() => {
    if (sort !== "newest") return null;
    const map = new Map<string, IPO[]>();
    for (const ipo of filtered) {
      if (!ipo.pricedDate) continue;
      const label = getWeekLabel(ipo.pricedDate);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(ipo);
    }
    // IPOs with no pricedDate go at the end
    const noDates = filtered.filter((i) => !i.pricedDate);
    const result = Array.from(map.entries()).map(([label, ipoList]) => ({
      label,
      ipos: ipoList,
    }));
    if (noDates.length > 0) {
      result.push({ label: "Undated", ipos: noDates });
    }
    return result;
  }, [filtered, sort]);

  return (
    <div>
      {/* Row 1: Sort tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {SORT_TABS.map(({ key, label }) => {
          const isActive = sort === key;
          return (
            <button
              key={key}
              onClick={() => setSort(key)}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#00FF41" : "#6A6A6A",
                background: isActive ? "#00FF4115" : "#141414",
                border: `1px solid ${isActive ? "#00FF4150" : "#222"}`,
                borderRadius: 20,
                padding: "6px 14px",
                cursor: "pointer",
                transition: "color 0.15s ease, background 0.15s ease, border-color 0.15s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "#9A9A9A";
                  (e.currentTarget as HTMLElement).style.borderColor = "#3A3A3A";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "#6A6A6A";
                  (e.currentTarget as HTMLElement).style.borderColor = "#222";
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Row 2: Sector pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {["All", ...sectors].map((sector) => {
          const isActive = activeSector === sector;
          return (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#00FF41" : "#6A6A6A",
                background: isActive ? "#00FF4115" : "#141414",
                border: `1px solid ${isActive ? "#00FF4150" : "#2A2A2A"}`,
                borderRadius: 20,
                padding: "6px 14px",
                cursor: "pointer",
                transition: "color 0.15s ease, background 0.15s ease, border-color 0.15s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "#9A9A9A";
                  (e.currentTarget as HTMLElement).style.borderColor = "#3A3A3A";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "#6A6A6A";
                  (e.currentTarget as HTMLElement).style.borderColor = "#2A2A2A";
                }
              }}
            >
              {sector}
            </button>
          );
        })}
      </div>

      {/* Row 3: Count + view toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 12,
            color: "#4A4A4A",
          }}
        >
          Showing {filtered.length} of {ipos.length} IPOs · {quotedCount} with live quotes
        </div>

        {/* View mode toggle */}
        <div
          style={{
            display: "inline-flex",
            border: "1px solid #222",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {(["grid", "list"] as ViewMode[]).map((mode) => {
            const isActive = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={mode === "grid" ? "Grid view" : "List view"}
                style={{
                  background: isActive ? "#00FF4115" : "#141414",
                  border: "none",
                  padding: "6px 10px",
                  cursor: "pointer",
                  color: isActive ? "#00FF41" : "#4A4A4A",
                  display: "flex",
                  alignItems: "center",
                  transition: "background 0.15s ease, color 0.15s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#9A9A9A";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#4A4A4A";
                  }
                }}
              >
                {mode === "grid" ? <GridIcon /> : <ListIcon />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "#141414",
            border: "1px solid #1A1A1A",
            borderRadius: 12,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              color: "#4A4A4A",
              margin: 0,
            }}
          >
            No IPOs match the current filters.
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* List view */
        <div
          style={{
            background: "#141414",
            border: "1px solid #1E1E1E",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 90px 80px 80px 80px",
              padding: "8px 16px",
              gap: 8,
              borderBottom: "1px solid #222",
            }}
          >
            <div />
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 10,
                color: "#4A4A4A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Company
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 10,
                color: "#4A4A4A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "right",
              }}
            >
              IPO Price
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 10,
                color: "#4A4A4A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "right",
              }}
            >
              Current
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 10,
                color: "#4A4A4A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "right",
              }}
            >
              Perf
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 10,
                color: "#4A4A4A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "right",
              }}
            >
              Date
            </div>
          </div>
          {filtered.map((ipo) => (
            <RecentIPORow key={ipo.symbol} ipo={ipo} />
          ))}
        </div>
      ) : grouped ? (
        /* Grouped grid view (sort = newest) */
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {grouped.map((group, index) => (
            <section key={group.label} style={{ marginTop: index > 0 ? 36 : 0 }}>
              {/* Section header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: "#00FF41",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    whiteSpace: "nowrap",
                  }}
                >
                  // {group.label}
                </span>
                <div style={{ flex: 1, borderTop: "1px solid #1E1E1E" }} />
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: "#4A4A4A",
                    whiteSpace: "nowrap",
                  }}
                >
                  {group.ipos.length} IPO{group.ipos.length !== 1 ? "s" : ""}
                </span>
              </div>
              {/* Cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
                  gap: 12,
                }}
              >
                {group.ipos.map((ipo) => (
                  <RecentIPOCard key={ipo.symbol} ipo={ipo} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Flat grid view (other sorts) */
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((ipo) => (
            <RecentIPOCard key={ipo.symbol} ipo={ipo} />
          ))}
        </div>
      )}
    </div>
  );
}
