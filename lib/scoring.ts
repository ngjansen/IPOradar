import type { IPO } from "./types";

const TECH_SECTORS = [
  "software", "semiconductor", "semiconductors", "ai", "cloud", "saas",
  "fintech", "cybersecurity", "internet", "technology", "tech",
];

const TECH_MULTIPLIER = 1.5;
const NEWS_WEIGHT = 10;

export function isTechSector(sector: string): boolean {
  const lower = sector.toLowerCase();
  return TECH_SECTORS.some((s) => lower.includes(s));
}

export function scoreIPOs(ipos: IPO[]): IPO[] {
  // Calculate max news count for normalization
  const maxNews = Math.max(...ipos.map((ipo) => ipo.newsCount), 1);

  return ipos
    .map((ipo) => {
      const newsScore = (ipo.newsCount / maxNews) * NEWS_WEIGHT;
      const techMultiplier = ipo.isTech ? TECH_MULTIPLIER : 1.0;
      const hypeScore = Math.round(newsScore * techMultiplier * 100) / 100;

      return { ...ipo, hypeScore };
    })
    .sort((a, b) => {
      // Primary: hype score descending
      if (b.hypeScore !== a.hypeScore) return b.hypeScore - a.hypeScore;
      // Secondary: date ascending (sooner = higher priority)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
}
