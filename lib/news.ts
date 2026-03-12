import Parser from "rss-parser";
import type { NewsItem } from "./types";

const parser = new Parser({
  timeout: 8000,
});

function buildGoogleNewsUrl(query: string): string {
  const encoded = encodeURIComponent(`"${query}" IPO`);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
}

export async function fetchNewsForCompany(company: string): Promise<NewsItem[]> {
  try {
    const url = buildGoogleNewsUrl(company);
    const res = await fetch(url, { next: { revalidate: 14400 } });
    const text = await res.text();
    const feed = await parser.parseString(text);

    return (feed.items || []).slice(0, 8).map((item) => ({
      title: item.title || "Untitled",
      url: item.link || "",
      source: item.creator || extractSourceFromTitle(item.title || ""),
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      snippet: stripHtml(item.contentSnippet || item.content || ""),
    }));
  } catch {
    return [];
  }
}

export async function fetchNewsCount(company: string): Promise<number> {
  try {
    const url = buildGoogleNewsUrl(company);
    const res = await fetch(url, { next: { revalidate: 14400 } });
    const text = await res.text();
    const feed = await parser.parseString(text);

    // Count articles from the last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentItems = (feed.items || []).filter((item) => {
      if (!item.pubDate) return false;
      return new Date(item.pubDate).getTime() > sevenDaysAgo;
    });

    return recentItems.length;
  } catch {
    return 0;
  }
}

function extractSourceFromTitle(title: string): string {
  const match = title.match(/ - ([^-]+)$/);
  return match ? match[1].trim() : "News";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}
