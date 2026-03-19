import type { IPO } from "./types";

const BASE = "https://finnhub.io/api/v1";

function getKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key || key === "your_finnhub_api_key_here") {
    throw new Error("FINNHUB_API_KEY is not configured");
  }
  return key;
}

function inferSector(company: string): string {
  const name = company.toLowerCase();
  if (name.includes("tech") || name.includes("software") || name.includes("digital") || name.includes("cyber") || name.includes("ai") || name.includes("data") || name.includes("cloud") || name.includes("saas")) return "Technology";
  if (name.includes("bio") || name.includes("pharma") || name.includes("health") || name.includes("med") || name.includes("therapeut") || name.includes("genomic")) return "Healthcare";
  if (name.includes("bank") || name.includes("financ") || name.includes("capital") || name.includes("invest") || name.includes("credit") || name.includes("pay")) return "Financial Services";
  if (name.includes("energy") || name.includes("oil") || name.includes("gas") || name.includes("solar") || name.includes("power") || name.includes("renewable")) return "Energy";
  if (name.includes("retail") || name.includes("consumer") || name.includes("food") || name.includes("beverage") || name.includes("brand")) return "Consumer";
  if (name.includes("real estate") || name.includes("reit") || name.includes("property")) return "Real Estate";
  if (name.includes("industrial") || name.includes("manufactur") || name.includes("aerospace") || name.includes("defense")) return "Industrials";
  return "Other";
}

function parseFinnhubPriceRange(price: string): string {
  if (!price || price === "0.00-0.00") return "TBD";
  // Finnhub format: "17.00-20.00"
  const parts = price.split("-");
  if (parts.length === 2) {
    const lo = parseFloat(parts[0]);
    const hi = parseFloat(parts[1]);
    if (!isNaN(lo) && !isNaN(hi) && (lo > 0 || hi > 0)) {
      return `$${lo.toFixed(2)} – $${hi.toFixed(2)}`;
    }
  }
  const single = parseFloat(price);
  if (!isNaN(single) && single > 0) return `$${single.toFixed(2)}`;
  return "TBD";
}

export async function fetchUpcomingIPOs(): Promise<IPO[]> {
  const key = getKey();
  const today = new Date().toISOString().split("T")[0];
  const to = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const url = `${BASE}/calendar/ipo?from=${today}&to=${to}&token=${key}`;
  const res = await fetch(url, { next: { revalidate: 14400 }, signal: AbortSignal.timeout(8000) });

  if (!res.ok) {
    throw new Error(`Finnhub IPO calendar error: ${res.status}`);
  }

  const data = await res.json();
  const items: Record<string, unknown>[] = data?.ipoCalendar ?? [];

  const TECH_SECTORS = ["technology", "software", "semiconductor", "ai", "cloud", "saas", "fintech", "cybersecurity", "internet"];

  return items
    .filter((item) => item.date && String(item.date) >= today)
    .map((item) => {
      const company = String(item.name || "Unknown");
      const exchange = String(item.exchange || "NASDAQ");
      const sector = inferSector(company);
      const isTech = TECH_SECTORS.some((s) => sector.toLowerCase().includes(s));

      return {
        symbol: String(item.symbol || ""),
        company,
        date: String(item.date || ""),
        exchange,
        priceRange: parseFinnhubPriceRange(String(item.price || "")),
        sharesOffered: Number(item.numberOfShares || 0),
        offerAmount: "",
        sector,
        industry: sector,
        newsCount: 0,
        hypeScore: 0,
        isTech,
        status: "upcoming" as const,
        filedDate: "",
        pricedDate: "",
      } satisfies IPO;
    });
}

export interface FinnhubProfile {
  description: string;
  name: string;
  ticker: string;
  exchange: string;
  country: string;
  weburl: string;
  employeeTotal: number | null;
  finnhubIndustry: string;
  logo: string;
}

export interface StockQuote {
  current: number;    // c — current price
  change: number;     // d — change from prev close
  changePct: number;  // dp — % change from prev close
  prevClose: number;  // pc
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const key = process.env.FINNHUB_API_KEY;
    if (!key || key === "your_finnhub_api_key_here") return null;

    const res = await fetch(`${BASE}/quote?symbol=${symbol}&token=${key}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || typeof data.c !== "number" || data.c === 0) return null;

    return {
      current: data.c,
      change: data.d ?? 0,
      changePct: data.dp ?? 0,
      prevClose: data.pc ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchCompanyProfile(symbol: string): Promise<FinnhubProfile | null> {
  try {
    const key = getKey();
    const res = await fetch(`${BASE}/stock/profile2?symbol=${symbol}&token=${key}`, {
      next: { revalidate: 14400 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || !data.name) return null;

    return {
      description: "",
      name: String(data.name || ""),
      ticker: String(data.ticker || symbol),
      exchange: String(data.exchange || ""),
      country: String(data.country || "US"),
      weburl: String(data.weburl || ""),
      employeeTotal: data.employeeTotal ? Number(data.employeeTotal) : null,
      finnhubIndustry: String(data.finnhubIndustry || ""),
      logo: String(data.logo || ""),
    };
  } catch {
    return null;
  }
}
