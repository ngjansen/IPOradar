import { NextResponse } from "next/server";
import { fetchUpcomingIPOs } from "@/lib/finnhub";
import { fetchNewsCount } from "@/lib/news";
import { scoreIPOs, isTechSector } from "@/lib/scoring";

export const revalidate = 14400; // 4 hours

// Fallback mock data for when API keys are not configured
const MOCK_IPOS = [
  {
    symbol: "DEMO1",
    company: "Acme Software Corp",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    exchange: "NASDAQ",
    priceRange: "$18.00 – $22.00",
    sharesOffered: 10000000,
    sector: "Technology",
    industry: "Software",
    newsCount: 12,
    hypeScore: 15,
    isTech: true,
  },
  {
    symbol: "DEMO2",
    company: "GreenBio Therapeutics",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    exchange: "NYSE",
    priceRange: "$12.00 – $15.00",
    sharesOffered: 5000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    newsCount: 7,
    hypeScore: 7,
    isTech: false,
  },
  {
    symbol: "DEMO3",
    company: "CloudMatrix AI",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    exchange: "NASDAQ",
    priceRange: "$25.00 – $30.00",
    sharesOffered: 8000000,
    sector: "AI",
    industry: "Artificial Intelligence",
    newsCount: 20,
    hypeScore: 18.75,
    isTech: true,
  },
  {
    symbol: "DEMO4",
    company: "Nexus Financial Group",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    exchange: "NYSE",
    priceRange: "$10.00 – $12.00",
    sharesOffered: 15000000,
    sector: "Financial Services",
    industry: "Banking",
    newsCount: 3,
    hypeScore: 3,
    isTech: false,
  },
  {
    symbol: "DEMO5",
    company: "CyberShield Security",
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    exchange: "NASDAQ",
    priceRange: "$20.00 – $24.00",
    sharesOffered: 6000000,
    sector: "Cybersecurity",
    industry: "Network Security",
    newsCount: 15,
    hypeScore: 14.25,
    isTech: true,
  },
];

export async function GET() {
  try {
    let ipos = await fetchUpcomingIPOs();

    // Enrich isTech flag with scoring lib
    ipos = ipos.map((ipo) => ({
      ...ipo,
      isTech: ipo.isTech || isTechSector(ipo.sector),
    }));

    // Fetch news counts in parallel (cap at 20 to stay within rate limits)
    const toEnrich = ipos.slice(0, 10);
    const newsCounts = await Promise.allSettled(
      toEnrich.map((ipo) => fetchNewsCount(ipo.company))
    );

    const enriched = toEnrich.map((ipo, i) => ({
      ...ipo,
      newsCount: newsCounts[i].status === "fulfilled" ? newsCounts[i].value : 0,
    }));

    // Append remaining IPOs without news counts
    const rest = ipos.slice(20);
    const allIPOs = [...enriched, ...rest];

    const scored = scoreIPOs(allIPOs);

    return NextResponse.json(scored);
  } catch (err) {
    console.error("GET /api/ipos error:", err);

    // Return mock data with a header indicating degraded mode
    return NextResponse.json(MOCK_IPOS, {
      headers: { "X-Data-Source": "mock" },
    });
  }
}
