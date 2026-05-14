"use client";

import { useState, useCallback } from "react";
import type { IPO, NewsItem } from "@/lib/types";
import { colors, fonts } from "@/lib/theme";

import { TopBar } from "./TopBar";
import { HeroDashboard } from "./HeroDashboard";
import { FilterBar } from "./FilterBar";
import { IPOCardV2 } from "./IPOCardV2";
import { CalendarView } from "./CalendarView";
import { ListView } from "./ListView";
import { WatchlistRail } from "./WatchlistRail";
import { CompareDrawer } from "./CompareDrawer";
import { RecentIPOsClient } from "./RecentIPOsClient";
import { SpeculationCard } from "./SpeculationCard";
import { SPECULATIVE_IPOS } from "@/lib/speculation";

type TabId = "upcoming" | "recent" | "speculation";
type ViewMode = "grid" | "list" | "calendar";
type SortKey = "date" | "hype" | "size";
type Density = "comfortable" | "compact";

interface HomeTabsClientProps {
  upcoming: IPO[];
  filed: IPO[];
  sectors: string[];
  activeSector: string;
  recentIpos: IPO[];
  specNewsMap: NewsItem[][];
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - today.getTime()) / 86400000);
}

function parseOfferAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const s = raw.replace("$", "").trim();
  if (s.endsWith("B")) return parseFloat(s) * 1e9;
  if (s.endsWith("M")) return parseFloat(s) * 1e6;
  return parseFloat(s.replace(/,/g, "")) || 0;
}

function sortIPOs(ipos: IPO[], sort: SortKey): IPO[] {
  return [...ipos].sort((a, b) => {
    if (sort === "hype") return (b.hypeScore ?? 0) - (a.hypeScore ?? 0);
    if (sort === "size") return parseOfferAmount(b.offerAmount) - parseOfferAmount(a.offerAmount);
    // date: upcoming first (smallest days), filed last
    const da = a.date ? daysUntil(a.date) : 9999;
    const db = b.date ? daysUntil(b.date) : 9999;
    return da - db;
  });
}

function SectionHeading({ label, count, dim }: { label: string; count: number; dim?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: dim ? colors.borderHi : colors.accent, flexShrink: 0 }} />
      <h2 style={{
        fontFamily: fonts.display, fontSize: 12, fontWeight: 700,
        color: dim ? colors.textFaint : colors.textDim,
        textTransform: "uppercase", letterSpacing: "0.12em", margin: 0,
      }}>{label}</h2>
      <span style={{
        fontFamily: fonts.mono, fontSize: 11, fontWeight: 600,
        color: dim ? colors.textFaint : colors.accent,
        background: dim ? colors.surfaceHi : colors.accentDim,
        border: `1px solid ${dim ? colors.border : colors.accent + "30"}`,
        borderRadius: 8, padding: "1px 8px",
      }}>{count}</span>
    </div>
  );
}

export function HomeTabsClient({
  upcoming,
  filed,
  sectors,
  activeSector: initialSector,
  recentIpos,
  specNewsMap,
}: HomeTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("date");
  const [density, setDensity] = useState<Density>("comfortable");
  const [search, setSearch] = useState("");
  const [activeSector, setActiveSector] = useState(initialSector);

  const totalArticles = specNewsMap.reduce((sum, items) => sum + items.length, 0);

  const toggleWatch = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol); else next.add(symbol);
      return next;
    });
  }, []);

  const toggleCompare = useCallback((symbol: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else if (next.size < 4) {
        next.add(symbol);
      }
      return next;
    });
  }, []);

  // Filter + sort upcoming + filed combined for views
  const allIPOs = [...upcoming, ...filed];

  function filterIPOs(list: IPO[]) {
    return list.filter((ipo) => {
      const matchSector = activeSector === "All" || ipo.sector === activeSector;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        ipo.company.toLowerCase().includes(q) ||
        ipo.symbol.toLowerCase().includes(q) ||
        (ipo.sector ?? "").toLowerCase().includes(q);
      return matchSector && matchSearch;
    });
  }

  const filteredUpcoming = filterIPOs(upcoming);
  const filteredFiled = filterIPOs(filed);
  const sortedUpcoming = sortIPOs(filteredUpcoming, sort);
  const sortedFiled = sortIPOs(filteredFiled, sort === "date" ? "date" : sort);
  const filteredAll = filterIPOs(allIPOs);

  const imminent = filteredUpcoming.filter(i => i.date && daysUntil(i.date) >= 0 && daysUntil(i.date) <= 7).sort((a, b) => a.date!.localeCompare(b.date!));
  const later = filteredUpcoming.filter(i => !i.date || daysUntil(i.date) < 0 || daysUntil(i.date) > 7);

  const showWatchlistRail = watchlist.size > 0;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      {/* Sticky top bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.size}
        compareCount={compareSet.size}
        onOpenCompare={() => {}}
      />

      {/* Hero — only on upcoming tab */}
      {activeTab === "upcoming" && (
        <HeroDashboard upcoming={upcoming} filed={filed} recentIpos={recentIpos} />
      )}

      {/* Filter bar — only on upcoming tab */}
      {activeTab === "upcoming" && (
        <FilterBar
          sectors={sectors}
          activeSector={activeSector}
          onSector={setActiveSector}
          search={search}
          onSearch={setSearch}
          sort={sort}
          onSort={setSort}
          density={density}
          onDensity={setDensity}
          view={view}
          onView={setView}
        />
      )}

      {/* ── UPCOMING TAB ── */}
      {activeTab === "upcoming" && (
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 24px 120px" }}>
          <div style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}>
            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {view === "calendar" && (
                <CalendarView ipos={filteredAll.filter(i => !!i.date)} />
              )}

              {view === "list" && (
                <ListView
                  ipos={[...sortedUpcoming, ...sortedFiled]}
                  watched={watchlist}
                  onWatch={toggleWatch}
                  compared={compareSet}
                  onCompare={toggleCompare}
                />
              )}

              {view === "grid" && (
                <>
                  {/* Upcoming confirmed */}
                  {filteredUpcoming.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                      <SectionHeading label="Confirmed — Date Set" count={filteredUpcoming.length} />
                      {imminent.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent, boxShadow: `0 0 8px ${colors.accent}, 0 0 16px ${colors.accent}60` }} />
                          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.15em" }}>This week</span>
                        </div>
                      )}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
                        gap: density === "compact" ? 10 : 14,
                      }}>
                        {sortedUpcoming.map((ipo) => (
                          <IPOCardV2
                            key={ipo.symbol}
                            ipo={ipo}
                            watched={watchlist.has(ipo.symbol)}
                            onWatch={toggleWatch}
                            compared={compareSet.has(ipo.symbol)}
                            onCompare={toggleCompare}
                            density={density}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filed / pipeline */}
                  {filteredFiled.length > 0 && (
                    <div>
                      <SectionHeading label="Filed S-1 — Date TBD" count={filteredFiled.length} dim />
                      <p style={{ fontFamily: fonts.ui, fontSize: 12, color: colors.textFaint, margin: "0 0 16px" }}>
                        These companies have filed registration statements but have not yet set an IPO date.
                      </p>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
                        gap: density === "compact" ? 10 : 12,
                      }}>
                        {sortedFiled.map((ipo) => (
                          <IPOCardV2
                            key={ipo.symbol}
                            ipo={ipo}
                            watched={watchlist.has(ipo.symbol)}
                            onWatch={toggleWatch}
                            compared={compareSet.has(ipo.symbol)}
                            onCompare={toggleCompare}
                            density={density}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredUpcoming.length === 0 && filteredFiled.length === 0 && (
                    <div style={{ padding: "60px 0", textAlign: "center", fontFamily: fonts.ui, fontSize: 14, color: colors.textMute }}>
                      No IPOs match your filters.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Watchlist rail */}
            {showWatchlistRail && (
              <WatchlistRail
                watchlist={watchlist}
                ipos={allIPOs}
                onRemove={toggleWatch}
              />
            )}
          </div>
        </div>
      )}

      {/* ── RECENT TAB ── */}
      {activeTab === "recent" && (
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 24px 80px" }}>
          <RecentIPOsClient ipos={recentIpos} />
        </div>
      )}

      {/* ── SPECULATION TAB ── */}
      {activeTab === "speculation" && (
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 24px 80px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 3, height: 22, borderRadius: 2, background: "#FFB800", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: "#FFB800", opacity: 0.6, letterSpacing: "0.15em", marginBottom: 2 }}>// rumoured · unconfirmed</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 700, color: colors.text, letterSpacing: "-0.04em", lineHeight: 1, margin: 0 }}>
                IPO Watch
              </h2>
            </div>
          </div>

          <div style={{
            background: "#141200", border: "1px solid #2A2000", borderLeft: "3px solid #FFB800",
            borderRadius: 8, padding: "12px 16px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 11, color: "#FFB800", flexShrink: 0 }}>⚠</span>
            <p style={{ fontFamily: fonts.ui, fontSize: 12, color: "#6A5A30", margin: 0, lineHeight: 1.5 }}>
              No SEC filings. Coverage based on public news and analyst commentary. Not financial advice.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 28, maxWidth: 400 }}>
            <div style={{ flex: 1, background: "linear-gradient(135deg, #141200 0%, #131100 100%)", border: "1px solid #2A2000", borderTop: "2px solid #FFB800", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "#6A5000", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Tracked</div>
              <div style={{ fontFamily: fonts.display, fontSize: 40, fontWeight: 700, color: "#FFB800", letterSpacing: "-0.04em", lineHeight: 1 }}>{SPECULATIVE_IPOS.length}</div>
              <div style={{ fontFamily: fonts.ui, fontSize: 10, color: "#4A3A00", marginTop: 6 }}>companies</div>
            </div>
            <div style={{ flex: 1, background: colors.surface, border: `1px solid ${colors.border}`, borderTop: `2px solid ${colors.borderHi}`, borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textFaint, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Articles</div>
              <div style={{ fontFamily: fonts.display, fontSize: 40, fontWeight: 700, color: colors.text, letterSpacing: "-0.04em", lineHeight: 1 }}>{totalArticles}</div>
              <div style={{ fontFamily: fonts.ui, fontSize: 10, color: colors.textMute, marginTop: 6 }}>recent news</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 12 }}>
            {SPECULATIVE_IPOS.map((company, i) => (
              <SpeculationCard key={company.name} company={company} news={specNewsMap[i]} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${colors.border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontFamily: fonts.ui, fontSize: 12, color: colors.textFaint, margin: "0 0 8px", lineHeight: 1.6 }}>
            IPO filing data sourced from{" "}
            <a href="https://www.nasdaq.com/market-activity/ipos" target="_blank" rel="noopener noreferrer" style={{ color: colors.textMute, textDecoration: "underline", textDecorationColor: colors.borderHi }}>Nasdaq EDGAR</a>
            {" "}and{" "}
            <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" style={{ color: colors.textMute, textDecoration: "underline", textDecorationColor: colors.borderHi }}>Finnhub</a>.
            {" "}News via{" "}
            <a href="https://news.google.com" target="_blank" rel="noopener noreferrer" style={{ color: colors.textMute, textDecoration: "underline", textDecorationColor: colors.borderHi }}>Google News</a>.
            {" "}Data refreshed every hour.
          </p>
          <p style={{ fontFamily: fonts.ui, fontSize: 11, color: colors.textFaint, margin: 0 }}>
            Not financial advice. For informational purposes only.
          </p>
        </div>
      </footer>

      {/* Compare drawer — fixed at bottom */}
      <CompareDrawer
        symbols={Array.from(compareSet)}
        ipos={allIPOs}
        onClose={() => setCompareSet(new Set())}
        onRemove={toggleCompare}
      />
    </div>
  );
}
