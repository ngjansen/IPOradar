"use client";

import { useState, useCallback, Suspense } from "react";
import type { IPO } from "@/lib/types";
import { IPOCard } from "./IPOCard";
import { SearchBar } from "./SearchBar";
import { SectorFilter } from "./SectorFilter";
import { Tooltip } from "./Tooltip";

interface IPOGridProps {
  upcoming: IPO[];
  filed: IPO[];
  activeSector: string;
  sectors: string[];
}

function SectionHeading({ label, count, dim, tooltip }: { label: string; count: number; dim?: boolean; tooltip?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      {/* Accent bar */}
      <div style={{ width: 3, height: 18, borderRadius: 2, background: dim ? "#2A2A2A" : "#00FF41", flexShrink: 0 }} />
      <Tooltip definition={tooltip ?? ""}>
        <h2
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: 12,
            fontWeight: 700,
            color: dim ? "#3A3A3A" : "#C0C0C0",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            margin: 0,
          }}
        >
          {label}
        </h2>
      </Tooltip>
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 11,
          fontWeight: 600,
          color: dim ? "#2A2A2A" : "#00FF41",
          background: dim ? "#111111" : "#00FF4115",
          border: `1px solid ${dim ? "#1E1E1E" : "#00FF4130"}`,
          borderRadius: 8,
          padding: "1px 8px",
        }}
      >
        {count}
      </span>
    </div>
  );
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function IPOGrid({ upcoming, filed, activeSector, sectors }: IPOGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);

  function filter(ipos: IPO[]) {
    return ipos.filter(ipo => {
      const matchesSector = activeSector === "All" || ipo.sector === activeSector;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ipo.company.toLowerCase().includes(q) ||
        ipo.symbol.toLowerCase().includes(q) ||
        ipo.sector.toLowerCase().includes(q);
      return matchesSector && matchesSearch;
    });
  }

  const filteredUpcoming = filter(upcoming);
  const filteredFiled = filter(filed);
  const total = filteredUpcoming.length + filteredFiled.length;

  const imminent = filteredUpcoming.filter(ipo => ipo.date && daysUntil(ipo.date) >= 0 && daysUntil(ipo.date) <= 7).sort((a, b) => a.date!.localeCompare(b.date!));
  const later = filteredUpcoming.filter(ipo => !ipo.date || daysUntil(ipo.date) < 0 || daysUntil(ipo.date) > 7);

  return (
    <div>
      {/* Confirmed upcoming — shown first, no filter needed */}
      {filteredUpcoming.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <SectionHeading label="Confirmed — Date Set" count={filteredUpcoming.length} tooltip="These companies have set an official IPO date. Shares will begin trading on the expected date." />
          {imminent.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 8px #00FF41, 0 0 16px #00FF4160" }} />
              <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#00FF41", textTransform: "uppercase", letterSpacing: "0.15em" }}>this week</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 16 }}>
            {[...imminent, ...later].map(ipo => <IPOCard key={ipo.symbol} ipo={ipo} />)}
          </div>
        </div>
      )}

      {/* Filter bar — between upcoming and filed */}
      {filed.length > 0 && (
        <div style={{ borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A", padding: "16px 0", marginBottom: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <Suspense fallback={null}>
            <SectorFilter sectors={sectors} />
          </Suspense>
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      {total === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", fontFamily: "var(--font-inter)", fontSize: 14, color: "#4A4A4A" }}>
          No IPOs match your filters.
        </div>
      ) : (
        <>
          {/* Filed / pipeline */}
          {filteredFiled.length > 0 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <SectionHeading label="Filed S-1 — Date TBD" count={filteredFiled.length} dim tooltip="An S-1 is a registration statement filed with the SEC to go public. These companies have filed but haven't set a trading date yet." />
                <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#3A3A3A", margin: 0 }}>
                  These companies have filed registration statements with the SEC but have not yet set an IPO date.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 12 }}>
                {filteredFiled.map(ipo => <IPOCard key={ipo.symbol} ipo={ipo} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
