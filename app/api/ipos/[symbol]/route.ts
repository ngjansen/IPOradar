import { NextResponse } from "next/server";
import { fetchUpcomingIPOs, fetchCompanyProfile } from "@/lib/finnhub";
import { fetchNasdaqIPOs, fetchRecentIPOs } from "@/lib/nasdaq";
import { fetchIPODetail } from "@/lib/fmp";
import type { IPODetail, IPO } from "@/lib/types";

export const revalidate = 14400; // 4 hours

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  if (!/^[A-Z0-9.]{1,6}$/i.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }
  const upper = symbol.toUpperCase();

  try {
    const [finnhubIPOs, nasdaq, recent] = await Promise.all([
      fetchUpcomingIPOs().catch(() => []),
      fetchNasdaqIPOs().catch(() => ({ upcoming: [], filed: [] })),
      fetchRecentIPOs().catch(() => []),
    ]);
    const baseIPO: IPO | undefined = finnhubIPOs.find((ipo) => ipo.symbol.toUpperCase() === upper)
      ?? nasdaq.upcoming.find((ipo) => ipo.symbol.toUpperCase() === upper)
      ?? nasdaq.filed.find((ipo) => ipo.symbol.toUpperCase() === upper)
      ?? recent.find((ipo) => ipo.symbol.toUpperCase() === upper);

    if (!baseIPO) {
      return NextResponse.json({ error: "IPO not found" }, { status: 404 });
    }

    // Fetch additional details in parallel
    const [fmpDetail, finnhubProfile] = await Promise.allSettled([
      fetchIPODetail(symbol),
      fetchCompanyProfile(symbol),
    ]);

    const fmpData = fmpDetail.status === "fulfilled" ? fmpDetail.value : {};
    const finnhubData = finnhubProfile.status === "fulfilled" ? finnhubProfile.value : null;

    const detail: IPODetail = {
      ...baseIPO,
      description:
        fmpData.description ||
        finnhubData?.description ||
        `${baseIPO.company} is preparing for its initial public offering on ${baseIPO.exchange}.`,
      website: fmpData.website || finnhubData?.weburl || "",
      employees: fmpData.employees || finnhubData?.employeeTotal || null,
      revenue: fmpData.revenue || null,
      underwriter: fmpData.underwriter || "",
      country: fmpData.country || finnhubData?.country || "US",
      ceo: fmpData.ceo || "",
      sector:
        fmpData.sector ||
        finnhubData?.finnhubIndustry ||
        baseIPO.sector,
      industry:
        fmpData.industry ||
        finnhubData?.finnhubIndustry ||
        baseIPO.industry,
      exchange:
        fmpData.exchange ||
        baseIPO.exchange,
    };

    return NextResponse.json(detail);
  } catch (err) {
    console.error(`GET /api/ipos/${symbol} error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch IPO details" },
      { status: 500 }
    );
  }
}
