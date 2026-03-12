export type IPOStatus = "upcoming" | "filed" | "priced";

export interface IPO {
  symbol: string;
  company: string;
  date: string;           // ISO date string e.g. "2025-04-10", or "" if TBD
  exchange: string;
  priceRange: string;     // e.g. "$18.00 – $20.00" or "TBD"
  sharesOffered: number;
  offerAmount: string;    // e.g. "$1.2B" or ""
  sector: string;
  industry: string;
  newsCount: number;
  hypeScore: number;
  isTech: boolean;
  status: IPOStatus;      // "upcoming" = confirmed date, "filed" = S-1 filed, date TBD, "priced" = IPO completed
  filedDate: string;      // when S-1 was filed (for "filed" status)
  pricedDate: string;     // when IPO priced (for "priced" status), ISO date
}

export interface IPODetail extends IPO {
  description: string;
  website: string;
  employees: number | null;
  revenue: number | null;
  underwriter: string;
  country: string;
  ceo: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;    // ISO date string
  snippet: string;
}
