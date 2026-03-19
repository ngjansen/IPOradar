import Anthropic from "@anthropic-ai/sdk";
import type { IPODetail, NewsItem, IPOAnalysis, AnalysisVerdict, AnalysisConfidence } from "./types";

const VERDICTS: AnalysisVerdict[] = ["BUY_NOW", "WAIT", "PASS", "HIGH_RISK"];
const CONFIDENCES: AnalysisConfidence[] = ["LOW", "MEDIUM", "HIGH"];

function buildPrompt(ipo: IPODetail, news: NewsItem[]): string {
  const desc = ipo.description ? ipo.description.slice(0, 400) : "No description available.";
  const perfLine = ipo.perfPct !== undefined
    ? `Performance since IPO: ${ipo.perfPct >= 0 ? "+" : ""}${ipo.perfPct.toFixed(1)}%`
    : null;

  const headlines = news.slice(0, 5).map((n, i) =>
    `${i + 1}. "${n.title}" — ${n.source} (${n.publishedAt.slice(0, 10)})`
  ).join("\n");

  return [
    `Company: ${ipo.company} (${ipo.symbol})`,
    `Sector: ${ipo.sector}`,
    `Description: ${desc}`,
    `Status: ${ipo.status}`,
    `Price Range: ${ipo.priceRange || "TBD"}`,
    `Offer Amount: ${ipo.offerAmount || "N/A"}`,
    `Shares Offered: ${ipo.sharesOffered ? (ipo.sharesOffered / 1e6).toFixed(1) + "M" : "N/A"}`,
    ipo.employees ? `Employees: ${ipo.employees.toLocaleString()}` : null,
    ipo.revenue ? `Revenue: $${ipo.revenue.toLocaleString()}` : null,
    ipo.underwriter ? `Underwriter: ${ipo.underwriter}` : null,
    `Exchange: ${ipo.exchange}`,
    `Country: ${ipo.country}`,
    `Hype Score: ${ipo.hypeScore}/20`,
    `News Article Count: ${ipo.newsCount}`,
    perfLine,
    news.length > 0 ? `\nRecent News Headlines:\n${headlines}` : null,
  ].filter(Boolean).join("\n");
}

function parseAnalysis(raw: string): IPOAnalysis | null {
  try {
    // Strip accidental code fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const obj = JSON.parse(cleaned);

    if (!VERDICTS.includes(obj.verdict)) return null;
    if (!CONFIDENCES.includes(obj.confidence)) return null;
    if (typeof obj.verdictLabel !== "string") return null;
    if (typeof obj.summary !== "string") return null;
    if (!Array.isArray(obj.bullCase) || obj.bullCase.length === 0) return null;
    if (!Array.isArray(obj.bearCase) || obj.bearCase.length === 0) return null;
    if (!Array.isArray(obj.keyRisks) || obj.keyRisks.length === 0) return null;
    if (typeof obj.timeHorizon !== "string") return null;

    return {
      verdict: obj.verdict,
      verdictLabel: obj.verdictLabel,
      confidence: obj.confidence,
      summary: obj.summary,
      bullCase: obj.bullCase.slice(0, 3),
      bearCase: obj.bearCase.slice(0, 3),
      keyRisks: obj.keyRisks.slice(0, 3),
      timeHorizon: obj.timeHorizon,
    };
  } catch {
    return null;
  }
}

export async function generateIPOAnalysis(
  ipo: IPODetail,
  news: NewsItem[]
): Promise<IPOAnalysis | null> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are an objective IPO analyst. Analyze the provided IPO data and return ONLY valid JSON matching this exact schema — no markdown, no code fences, no commentary:

{
  "verdict": "BUY_NOW" | "WAIT" | "PASS" | "HIGH_RISK",
  "verdictLabel": string,
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "summary": string,
  "bullCase": string[],
  "bearCase": string[],
  "keyRisks": string[],
  "timeHorizon": string
}

Verdict guidelines:
- BUY_NOW: strong fundamentals, reasonable valuation, favorable sector timing
- WAIT: mixed signals; better entry likely after lock-up expiry or first earnings
- PASS: weak fundamentals, overvalued, or poor sector timing
- HIGH_RISK: pre-revenue, speculative, binary outcome, or extreme expected volatility

verdictLabel examples: "Strong Buy", "Wait for Lock-Up", "Avoid", "Speculative Play", "High Volatility Risk"
bullCase/bearCase/keyRisks: 2–3 concise items each (plain strings, no bullet prefix)
timeHorizon: e.g. "Short-term (1–3 months)", "Medium-term (6–12 months)"
summary: 2–3 sentences, objective tone

This is for informational purposes only — not financial advice.`,
      messages: [
        {
          role: "user",
          content: buildPrompt(ipo, news),
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    return parseAnalysis(textBlock.text);
  } catch {
    return null;
  }
}
