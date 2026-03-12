import { NextResponse } from "next/server";
import { fetchNewsForCompany } from "@/lib/news";

// No cache — always fresh
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company");

  if (!company) {
    return NextResponse.json({ error: "Missing ?company= parameter" }, { status: 400 });
  }

  try {
    const articles = await fetchNewsForCompany(company);
    return NextResponse.json(articles, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("GET /api/news error:", err);
    return NextResponse.json([], {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
