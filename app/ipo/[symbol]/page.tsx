import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { IPODetail } from "@/lib/types";
import { LetterAvatar } from "@/components/LetterAvatar";
import { NewsFeed } from "@/components/NewsFeed";
import { BrokerCTA } from "@/components/BrokerCTA";
import { IPOAlertSignup } from "@/components/IPOAlertSignup";
import { fetchUpcomingIPOs, fetchCompanyProfile, fetchStockQuote } from "@/lib/finnhub";
import type { StockQuote } from "@/lib/finnhub";
import { fetchNasdaqIPOs, fetchRecentIPOs } from "@/lib/nasdaq";
import { fetchIPODetail } from "@/lib/fmp";

export const revalidate = 14400;

async function getIPODetail(symbol: string): Promise<{ ipo: IPODetail; quote: StockQuote | null } | null> {
  try {
    const upper = symbol.toUpperCase();

    const [finnhubIPOs, nasdaq, recent] = await Promise.all([
      fetchUpcomingIPOs().catch(() => []),
      fetchNasdaqIPOs().catch(() => ({ upcoming: [], filed: [] })),
      fetchRecentIPOs().catch(() => []),
    ]);
    const baseIPO = finnhubIPOs.find((ipo) => ipo.symbol.toUpperCase() === upper)
      ?? nasdaq.upcoming.find((ipo) => ipo.symbol.toUpperCase() === upper)
      ?? nasdaq.filed.find((ipo) => ipo.symbol.toUpperCase() === upper)
      ?? recent.find((ipo) => ipo.symbol.toUpperCase() === upper);

    if (!baseIPO) return null;

    const [fmpData, finnhubData, quote] = await Promise.all([
      fetchIPODetail(symbol).catch((): Partial<IPODetail> => ({})),
      fetchCompanyProfile(symbol).catch(() => null),
      baseIPO.status === "priced"
        ? fetchStockQuote(symbol).catch(() => null)
        : Promise.resolve(null),
    ]);

    // Parse IPO price from priceRange string (e.g. "$14.00" or "$12.00 - $14.00")
    const ipoPrice = baseIPO.priceRange
      ? parseFloat(baseIPO.priceRange.replace(/[^0-9.]/g, "").split(" ")[0]) || null
      : null;

    const ipo: IPODetail = {
      ...baseIPO,
      description:
        fmpData.description ||
        `${baseIPO.company} is an upcoming initial public offering on ${baseIPO.exchange || "a major exchange"}.`,
      website: fmpData.website || finnhubData?.weburl || "",
      employees: fmpData.employees || finnhubData?.employeeTotal || null,
      revenue: fmpData.revenue || null,
      underwriter: fmpData.underwriter || "",
      country: fmpData.country || finnhubData?.country || "US",
      ceo: fmpData.ceo || "",
      sector: fmpData.sector || finnhubData?.finnhubIndustry || baseIPO.sector,
      industry: fmpData.industry || finnhubData?.finnhubIndustry || baseIPO.industry,
      exchange: fmpData.exchange || baseIPO.exchange,
      currentPrice: quote?.current ?? undefined,
      perfPct: quote && ipoPrice && ipoPrice > 0
        ? ((quote.current - ipoPrice) / ipoPrice) * 100
        : undefined,
    };

    return { ipo, quote };
  } catch {
    return null;
  }
}

async function getAllIPOSymbols(): Promise<string[]> {
  try {
    const [finnhubIPOs, nasdaq, recent] = await Promise.allSettled([
      fetchUpcomingIPOs(),
      fetchNasdaqIPOs(),
      fetchRecentIPOs(),
    ]);

    const symbols: string[] = [];
    if (finnhubIPOs.status === "fulfilled") symbols.push(...finnhubIPOs.value.map(i => i.symbol));
    if (nasdaq.status === "fulfilled") {
      symbols.push(...nasdaq.value.upcoming.map(i => i.symbol));
      symbols.push(...nasdaq.value.filed.map(i => i.symbol));
    }
    if (recent.status === "fulfilled") symbols.push(...recent.value.map(i => i.symbol));

    return [...new Set(symbols)].filter(Boolean);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const symbols = await getAllIPOSymbols();
  return symbols.map((symbol) => ({ symbol }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  const result = await getIPODetail(symbol);

  if (!result) {
    return { title: `${symbol} IPO — IPOradar` };
  }

  const { ipo } = result;

  if (ipo.status === "filed") {
    return {
      title: `${ipo.company} IPO — Filed S-1, Date TBD`,
      description: `${ipo.company} (${ipo.symbol}) has filed an S-1 with the SEC. IPO date is pending. ${ipo.description?.slice(0, 100) || ""}`,
    };
  }
  if (ipo.status === "priced") {
    return {
      title: `${ipo.company} IPO — Priced at ${ipo.priceRange}`,
      description: `${ipo.company} (${ipo.symbol}) priced its IPO on ${ipo.pricedDate} at ${ipo.priceRange}. ${ipo.description?.slice(0, 100) || ""}`,
    };
  }
  return {
    title: `${ipo.company} IPO — ${ipo.date}, ${ipo.priceRange} & Latest News`,
    description: `${ipo.company} (${ipo.symbol}) IPO on ${ipo.exchange}. Expected date: ${ipo.date}. Price range: ${ipo.priceRange}. ${ipo.description?.slice(0, 100) || ""}`,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatRevenue(revenue: number): string {
  if (revenue >= 1e9) return `$${(revenue / 1e9).toFixed(1)}B`;
  if (revenue >= 1e6) return `$${(revenue / 1e6).toFixed(0)}M`;
  return `$${revenue.toLocaleString()}`;
}

function formatSign(n: number): string {
  return n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

function formatPct(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function parseIPOPrice(priceRange: string | undefined): number | null {
  if (!priceRange) return null;
  // For priced IPOs, priceRange is often just "$14.00" or the offer price
  const nums = priceRange.replace(/[^0-9.]/g, " ").trim().split(/\s+/).filter(Boolean).map(Number);
  if (nums.length === 0) return null;
  // If range like "12.00 14.00", take average; if single price, use it
  return nums.length >= 2 ? (nums[0] + nums[nums.length - 1]) / 2 : nums[0];
}

export default async function IPODetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const result = await getIPODetail(symbol);

  if (!result) {
    notFound();
  }

  const { ipo, quote } = result;

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid #1A1A1A",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#0D0D0D",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: 18,
            fontWeight: 700,
            color: "#F0F0F0",
            letterSpacing: "-0.04em",
            textDecoration: "none",
          }}
        >
          IPO<span style={{ color: "#00FF41" }}>radar</span>
        </Link>
        <span style={{ color: "#2A2A2A" }}>›</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            color: "#6A6A6A",
          }}
        >
          {ipo.symbol}
        </span>
      </nav>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 24px 80px",
        }}
      >
        {/* Hero */}
        <div
          style={{
            background: "#141414",
            border: `1px solid ${ipo.isTech ? "#00FF4130" : "#222"}`,
            borderRadius: 16,
            padding: "32px",
            marginBottom: 32,
            ...(ipo.isTech ? {
              borderLeft: "3px solid #00FF41",
              boxShadow: "-4px 0 20px #00FF4115",
            } : {}),
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <LetterAvatar name={ipo.company} size="lg" />

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: "#00FF41",
                    background: "#00FF4110",
                    border: "1px solid #00FF4130",
                    borderRadius: 4,
                    padding: "2px 8px",
                    marginBottom: 8,
                    display: "inline-block",
                  }}
                >
                  ${ipo.symbol}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "clamp(22px, 4vw, 36px)",
                  fontWeight: 700,
                  color: "#F0F0F0",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                {ipo.company}
              </h1>
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  color: "#6A6A6A",
                }}
              >
                {ipo.sector} · {ipo.exchange}
                {ipo.ceo && ` · CEO: ${ipo.ceo}`}
              </div>
            </div>

            {/* All IPO + Company stats — grid fills available space */}
            {(() => {
              const ipoPrice = parseIPOPrice(ipo.priceRange);
              const stats: Array<{ label: string; value: string; accent?: boolean; href?: string }> = [
                ipo.status === "upcoming" && ipo.date ? { label: "Expected Date", value: formatDate(ipo.date), accent: false } : null,
                ipo.status === "filed" && ipo.filedDate ? { label: "Filed Date", value: formatDate(ipo.filedDate) } : null,
                ipo.status === "priced" && ipo.pricedDate ? { label: "Priced Date", value: formatDate(ipo.pricedDate) } : null,
                ipo.status === "priced" && quote ? { label: "Current Price", value: `$${quote.current.toFixed(2)}`, accent: true } : null,
                ipo.status === "priced" && quote ? { label: "Day Change", value: `${formatSign(quote.change)} (${formatPct(quote.changePct)})`, accent: true } : null,
                ipo.perfPct !== undefined ? { label: "Since IPO", value: formatPct(ipo.perfPct), accent: true } : null,
                ipo.priceRange ? { label: ipo.status === "priced" ? "Priced At" : "Price Range", value: ipo.priceRange, accent: ipo.status !== "priced" } : null,
                ipoPrice && ipo.status === "priced" ? { label: "IPO Price", value: `$${ipoPrice.toFixed(2)}` } : null,
                ipo.offerAmount ? { label: "Offer Size", value: ipo.offerAmount } : null,
                ipo.sharesOffered ? { label: "Shares Offered", value: (ipo.sharesOffered / 1e6).toFixed(1) + "M" } : null,
                ipo.underwriter ? { label: "Underwriter", value: ipo.underwriter } : null,
                ipo.exchange ? { label: "Exchange", value: ipo.exchange } : null,
                ipo.sector ? { label: "Sector", value: ipo.sector } : null,
                ipo.industry && ipo.industry !== ipo.sector ? { label: "Industry", value: ipo.industry } : null,
                ipo.country ? { label: "Country", value: ipo.country } : null,
                ipo.employees ? { label: "Employees", value: ipo.employees.toLocaleString() } : null,
                ipo.revenue ? { label: "Revenue", value: formatRevenue(ipo.revenue) } : null,
                ipo.hypeScore > 0 ? { label: "Hype Score", value: ipo.hypeScore.toFixed(1), accent: true } : null,
                ipo.status === "filed" ? { label: "SEC Filing", value: "View S-1 ↗", href: `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(ipo.symbol)}%22&dateRange=custom&startdt=2025-01-01&forms=S-1` } : null,
                ipo.website ? { label: "Website", value: ipo.website.replace(/^https?:\/\//, ""), href: ipo.website } : null,
              ].filter(Boolean) as Array<{ label: string; value: string; accent?: boolean; href?: string }>;

              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "14px 20px", flex: 1, minWidth: 0 }}>
                  {stats.map((s, i) => (
                    <div key={i}>
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                        {s.label}
                      </div>
                      {s.href ? (
                        <a href={s.href} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "#00FF41", textDecoration: "none", display: "block" }}>
                          {s.value}
                        </a>
                      ) : (
                        <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: s.accent ? "#00FF41" : "#C0C0C0", fontWeight: s.accent ? 600 : 400 }}>
                          {s.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* CTA strip — inline in hero */}
          <div style={{ borderTop: "1px solid #1E1E1E", marginTop: 24, paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {ipo.status === "priced" ? (
                <>
                  <a href={`https://robinhood.com/us/en/stocks/${ipo.symbol}/`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 700, textDecoration: "none", borderRadius: 7, padding: "9px 18px", background: "#00FF41", color: "#0D0D0D", whiteSpace: "nowrap" as const }}>
                    Trade on Robinhood →
                  </a>
                  <a href={`https://www.webull.com/quote/nasdaq-${ipo.symbol.toLowerCase()}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    Webull
                  </a>
                  <a href="https://www.fidelity.com/trading/ipos" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    Fidelity
                  </a>
                  <a href="https://www.interactivebrokers.com/mkt/?src=ibkrwebu7&url=%2Fen%2Ftrading%2Fnew-issues-ipo.php" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    IBKR
                  </a>
                </>
              ) : ipo.status === "upcoming" ? (
                <>
                  <a href="https://robinhood.com/us/en/support/articles/ipo-access/" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 700, textDecoration: "none", borderRadius: 7, padding: "9px 18px", background: "#00FF41", color: "#0D0D0D", whiteSpace: "nowrap" as const }}>
                    Robinhood IPO Access →
                  </a>
                  <a href="https://www.webull.com/quote/us/ipo" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    Webull IPO Center
                  </a>
                  <a href="https://www.fidelity.com/trading/ipos" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    Fidelity
                  </a>
                </>
              ) : (
                <>
                  <a href="https://robinhood.com/us/en/support/articles/ipo-access/" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    Robinhood →
                  </a>
                  <a href="https://www.webull.com/quote/us/ipo" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    Webull →
                  </a>
                  <a href="https://www.fidelity.com/trading/ipos" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    Fidelity →
                  </a>
                  <a href="https://www.interactivebrokers.com/mkt/?src=ibkrwebu7&url=%2Fen%2Ftrading%2Fnew-issues-ipo.php" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, textDecoration: "none", borderRadius: 7, padding: "9px 16px", background: "transparent", color: "#9A9A9A", border: "1px solid #2A2A2A", whiteSpace: "nowrap" as const }}>
                    IBKR →
                  </a>
                </>
              )}
            </div>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#2A2A2A" }}>
              Not financial advice.
            </span>
          </div>
        </div>

        {/* Live Market Data card — priced + quote only */}
        {ipo.status === "priced" && quote && (() => {
          const ipoPrice = parseIPOPrice(ipo.priceRange);
          const tiles = [
            {
              label: "Current Price",
              value: `$${quote.current.toFixed(2)}`,
              color: quote.change >= 0 ? "#00FF41" : "#FF4444",
            },
            {
              label: "Day Change",
              value: formatPct(quote.changePct),
              sub: formatSign(quote.change),
              color: quote.change >= 0 ? "#00FF41" : "#FF4444",
            },
            {
              label: "Since IPO",
              value: ipo.perfPct !== undefined ? formatPct(ipo.perfPct) : "—",
              color: ipo.perfPct !== undefined ? (ipo.perfPct >= 0 ? "#00FF41" : "#FF4444") : "#6A6A6A",
            },
            {
              label: "IPO Price",
              value: ipoPrice ? `$${ipoPrice.toFixed(2)}` : (ipo.priceRange || "—"),
              color: "#9A9A9A",
            },
          ];
          return (
            <div
              style={{
                background: "#141414",
                border: "1px solid #222",
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 32,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0,
              }}
            >
              {tiles.map((tile, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 20px",
                    borderRight: i < 3 ? "1px solid #222" : "none",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    {tile.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 22, fontWeight: 700, color: tile.color, letterSpacing: "-0.02em" }}>
                    {tile.value}
                  </div>
                  {tile.sub && (
                    <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: tile.color, marginTop: 4, opacity: 0.7 }}>
                      {tile.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Two-column layout — news dominant left, details right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 280px)",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* LEFT: News feed (dominant) */}
          <div>
            {/* About — compact, above news */}
            {ipo.description && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#6A6A6A", lineHeight: 1.7, margin: 0 }}>
                  {ipo.description}
                </p>
              </div>
            )}
            <NewsFeed company={ipo.company} />
          </div>

          {/* RIGHT: email signup only (details are in the hero) */}
          <div style={{ position: "sticky", top: 72 }}>
            <IPOAlertSignup />
          </div>
        </div>
      </div>
    </div>
  );
}
