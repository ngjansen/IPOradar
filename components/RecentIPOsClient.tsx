"use client";

import { useState, useMemo } from "react";
import type { IPO } from "@/lib/types";
import { RecentIPOCard } from "./RecentIPOCard";

type SortKey = "newest" | "best" | "worst" | "largest";
type QuoteFilter = "all" | "winners" | "losers";

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

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "best", label: "Best Performer" },
  { key: "worst", label: "Worst Performer" },
  { key: "largest", label: "Largest Raise" },
];

export function RecentIPOsClient({ ipos }: RecentIPOsClientProps) {
  const [sort, setSort] = useState<SortKey>("newest");
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>("all");
  const [activeSector, setActiveSector] = useState<string>("All");

  const sectors = useMemo(
    () => Array.from(new Set(ipos.map((i) => i.sector).filter(Boolean))).sort() as string[],
    [ipos]
  );

  const quotedCount = useMemo(
    () => ipos.filter((i) => typeof i.perfPct === "number").length,
    [ipos]
  );

  const filtered = useMemo(() => {
    let result = [...ipos];

    // Apply quote filter
    if (quoteFilter === "winners") {
      result = result.filter((i) => typeof i.perfPct === "number" && i.perfPct >= 0);
    } else if (quoteFilter === "losers") {
      result = result.filter((i) => typeof i.perfPct === "number" && i.perfPct < 0);
    }

    // Apply sector filter
    if (activeSector !== "All") {
      result = result.filter((i) => i.sector === activeSector);
    }

    // Sort
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
      result.sort((a, b) => parseOfferAmount(b.offerAmount) - parseOfferAmount(a.offerAmount));
    }

    return result;
  }, [ipos, sort, quoteFilter, activeSector]);

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

      {/* Row 2: Quote filter + sector pills */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {/* Segmented quote filter */}
        <div
          style={{
            display: "inline-flex",
            border: "1px solid #222",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {(["all", "winners", "losers"] as QuoteFilter[]).map((opt) => {
            const isActive = quoteFilter === opt;
            const label = opt === "all" ? "All" : opt === "winners" ? "Winners" : "Losers";
            const activeColor = opt === "losers" ? "#FF4444" : "#00FF41";
            const activeBg = opt === "losers" ? "#FF444415" : "#00FF4115";

            return (
              <button
                key={opt}
                onClick={() => setQuoteFilter(opt)}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? activeColor : "#6A6A6A",
                  background: isActive ? activeBg : "#141414",
                  border: "none",
                  borderRadius: 0,
                  padding: "6px 14px",
                  cursor: "pointer",
                  transition: "color 0.15s ease, background 0.15s ease",
                  outline: "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Sector pills */}
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

      {/* Row 3: Count */}
      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 12,
          color: "#4A4A4A",
          marginBottom: 20,
        }}
      >
        Showing {filtered.length} of {ipos.length} IPOs · {quotedCount} with live quotes
      </div>

      {/* Grid or empty state */}
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
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#4A4A4A", margin: 0 }}>
            No IPOs match the current filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
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
