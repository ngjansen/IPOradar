/**
 * fmp.ts — FMP used only for company profile/detail enrichment.
 * IPO calendar is sourced from Finnhub (see finnhub.ts).
 * FMP v3 IPO calendar was deprecated August 2025.
 */
import type { IPODetail } from "./types";

const BASE = "https://financialmodelingprep.com/stable";

function getFMPKey(): string | null {
  const key = process.env.FMP_API_KEY;
  if (!key || key === "your_fmp_api_key_here") return null;
  return key;
}

export async function fetchIPODetail(symbol: string): Promise<Partial<IPODetail>> {
  const key = getFMPKey();
  if (!key) return {};

  try {
    const res = await fetch(`${BASE}/profile/${symbol}?apikey=${key}`, {
      next: { revalidate: 14400 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return {};

    const data = await res.json();
    const profile = Array.isArray(data) ? data[0] : data;
    if (!profile || !profile.companyName) return {};

    return {
      description: String(profile.description || ""),
      website: String(profile.website || ""),
      employees: profile.fullTimeEmployees ? Number(profile.fullTimeEmployees) : null,
      revenue: null,
      underwriter: "",
      country: String(profile.country || "US"),
      ceo: String(profile.ceo || ""),
      sector: String(profile.sector || ""),
      industry: String(profile.industry || ""),
      exchange: String(profile.exchangeShortName || ""),
    };
  } catch {
    return {};
  }
}
