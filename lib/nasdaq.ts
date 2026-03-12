import type { IPO } from "./types";

const NASDAQ_API = "https://api.nasdaq.com/api/ipo/calendar";

const HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Origin": "https://www.nasdaq.com",
  "Referer": "https://www.nasdaq.com/",
};

const TECH_KEYWORDS = [
  "tech", "software", "digital", "cyber", "ai", "data", "cloud", "saas",
  "semiconductor", "chip", "compute", "intel", "micro", "nano", "quantum",
  "network", "web", "app", "platform", "automation", "robot", "drone",
  "fintech", "payment", "pay", "crypto", "blockchain",
];

function inferSector(company: string): string {
  const name = company.toLowerCase();
  if (TECH_KEYWORDS.some(k => name.includes(k))) return "Technology";
  if (/bio|pharma|health|med|therapeut|genomic|clinical|oncol/.test(name)) return "Healthcare";
  if (/bank|financ|capital|invest|credit|wealth|asset|fund/.test(name)) return "Financial Services";
  if (/energy|oil|gas|solar|power|renewable|wind|nuclear/.test(name)) return "Energy";
  if (/retail|consumer|food|beverage|brand|fashion|apparel/.test(name)) return "Consumer";
  if (/real estate|reit|property|realty/.test(name)) return "Real Estate";
  if (/industrial|manufactur|aerospace|defense|construct/.test(name)) return "Industrials";
  if (/acqui|holdings|merger|spac/.test(name)) return "SPAC";
  return "Other";
}

function isTechSector(sector: string, company: string): boolean {
  if (sector === "Technology") return true;
  const name = company.toLowerCase();
  return TECH_KEYWORDS.some(k => name.includes(k));
}

function parseNasdaqDate(dateStr: string): string {
  // Nasdaq format: "3/12/2026"
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function formatOfferAmount(raw: string): string {
  if (!raw) return "";
  // raw like "$1,264,705,900" or "$40,875,000"
  const num = parseFloat(raw.replace(/[$,]/g, ""));
  if (isNaN(num)) return "";
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  return raw;
}

function parsePriceRange(raw: string): string {
  if (!raw || raw === "0.00" || raw === "0.00-0.00") return "TBD";
  const trimmed = raw.replace(/^\$/, "");
  if (trimmed.includes("-")) {
    const [lo, hi] = trimmed.split("-").map(s => parseFloat(s.trim()));
    if (!isNaN(lo) && !isNaN(hi)) return `$${lo.toFixed(2)} – $${hi.toFixed(2)}`;
  }
  const single = parseFloat(trimmed);
  if (!isNaN(single) && single > 0) return `$${single.toFixed(2)}`;
  return "TBD";
}

function parseShares(raw: string): number {
  if (!raw) return 0;
  return parseInt(raw.replace(/,/g, ""), 10) || 0;
}

async function fetchMonth(yearMonth: string): Promise<{ upcoming: IPO[]; filed: IPO[] }> {
  const res = await fetch(`${NASDAQ_API}?date=${yearMonth}`, {
    headers: HEADERS,
    next: { revalidate: 14400 },
  });

  if (!res.ok) throw new Error(`Nasdaq API error: ${res.status}`);

  const data = await res.json();
  const today = new Date().toISOString().split("T")[0];

  // --- Upcoming (confirmed date) ---
  const upcomingRows: Record<string, string>[] =
    data?.data?.upcoming?.upcomingTable?.rows ?? [];

  const upcoming: IPO[] = upcomingRows
    .filter(r => {
      const date = parseNasdaqDate(r.expectedPriceDate);
      return date >= today; // only future
    })
    .map(r => {
      const company = r.companyName ?? "";
      const sector = inferSector(company);
      const date = parseNasdaqDate(r.expectedPriceDate);

      return {
        symbol: r.proposedTickerSymbol ?? "",
        company,
        date,
        exchange: r.proposedExchange ?? "",
        priceRange: parsePriceRange(r.proposedSharePrice ?? ""),
        sharesOffered: parseShares(r.sharesOffered ?? ""),
        offerAmount: formatOfferAmount(r.dollarValueOfSharesOffered ?? ""),
        sector,
        industry: sector,
        newsCount: 0,
        hypeScore: 0,
        isTech: isTechSector(sector, company),
        status: "upcoming" as const,
        filedDate: "",
        pricedDate: "",
      };
    });

  // --- Filed (S-1 filed, date TBD) ---
  const filedRows: Record<string, string>[] =
    data?.data?.filed?.rows ?? [];

  const filed: IPO[] = filedRows.map(r => {
    const company = r.companyName ?? "";
    const sector = inferSector(company);

    return {
      symbol: r.proposedTickerSymbol ?? "",
      company,
      date: "",         // TBD
      exchange: "",
      priceRange: "TBD",
      sharesOffered: 0,
      offerAmount: formatOfferAmount(r.dollarValueOfSharesOffered ?? ""),
      sector,
      industry: sector,
      newsCount: 0,
      hypeScore: 0,
      isTech: isTechSector(sector, company),
      status: "filed" as const,
      filedDate: parseNasdaqDate(r.filedDate ?? ""),
      pricedDate: "",
    };
  });

  return { upcoming, filed };
}

export async function fetchNasdaqIPOs(): Promise<{ upcoming: IPO[]; filed: IPO[] }> {
  const today = new Date();
  const months = [
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
    `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}`,
    `${today.getFullYear()}-${String(today.getMonth() + 3).padStart(2, "0")}`,
  ];

  const results = await Promise.allSettled(months.map(fetchMonth));

  const allUpcoming: IPO[] = [];
  const allFiled: IPO[] = [];
  const seenSymbols = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const ipo of result.value.upcoming) {
      if (ipo.symbol && !seenSymbols.has(ipo.symbol)) {
        seenSymbols.add(ipo.symbol);
        allUpcoming.push(ipo);
      }
    }
    for (const ipo of result.value.filed) {
      if (ipo.symbol && !seenSymbols.has(ipo.symbol)) {
        seenSymbols.add(ipo.symbol);
        allFiled.push(ipo);
      }
    }
  }

  // Sort upcoming by date asc
  allUpcoming.sort((a, b) => a.date.localeCompare(b.date));
  // Sort filed by filedDate desc (most recent first)
  allFiled.sort((a, b) => b.filedDate.localeCompare(a.filedDate));

  return { upcoming: allUpcoming, filed: allFiled };
}

async function fetchMonthPriced(yearMonth: string): Promise<IPO[]> {
  const res = await fetch(`${NASDAQ_API}?date=${yearMonth}`, {
    headers: HEADERS,
    next: { revalidate: 14400 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const pricedRows: Record<string, string>[] =
    data?.data?.priced?.rows ?? [];

  return pricedRows.map(r => {
    const company = r.companyName ?? "";
    const sector = inferSector(company);

    return {
      symbol: r.proposedTickerSymbol ?? "",
      company,
      date: "",
      exchange: r.proposedExchange ?? "",
      priceRange: r.proposedSharePrice ? `$${parseFloat(r.proposedSharePrice).toFixed(2)}` : "TBD",
      sharesOffered: 0,
      offerAmount: formatOfferAmount(r.dollarValueOfSharesOffered ?? ""),
      sector,
      industry: sector,
      newsCount: 0,
      hypeScore: 0,
      isTech: isTechSector(sector, company),
      status: "priced" as const,
      filedDate: "",
      pricedDate: parseNasdaqDate(r.pricedDate ?? ""),
    };
  });
}

export async function fetchRecentIPOs(): Promise<IPO[]> {
  const today = new Date();
  const months: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const results = await Promise.allSettled(months.map(fetchMonthPriced));

  const all: IPO[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const ipo of result.value) {
      if (ipo.symbol && !seen.has(ipo.symbol)) {
        seen.add(ipo.symbol);
        all.push(ipo);
      }
    }
  }

  // Sort by pricedDate descending (most recent first)
  all.sort((a, b) => b.pricedDate.localeCompare(a.pricedDate));

  return all;
}
