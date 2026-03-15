export interface SpeculativeCompany {
  name: string;
  sector: string;
  valuation: string;
  timeline: string;
  description: string;
}

export const SPECULATIVE_IPOS: SpeculativeCompany[] = [
  {
    name: "SpaceX",
    sector: "Aerospace",
    valuation: "~$350B",
    timeline: "2026 Speculation",
    description: "Rocket launch and satellite internet company; Starlink may IPO separately.",
  },
  {
    name: "Stripe",
    sector: "Fintech",
    valuation: "~$65B",
    timeline: "Long-awaited",
    description: "Global payments infrastructure powering millions of online businesses.",
  },
  {
    name: "Databricks",
    sector: "Data/AI",
    valuation: "~$62B",
    timeline: "2025–2026 Window",
    description: "Unified data analytics and AI platform built on Apache Spark.",
  },
  {
    name: "Anduril",
    sector: "Defense Tech",
    valuation: "~$28B",
    timeline: "2026 Rumored",
    description: "AI-powered defense technology company building autonomous systems.",
  },
  {
    name: "Chime",
    sector: "Fintech",
    valuation: "~$25B",
    timeline: "Multiple Delays",
    description: "Neobank offering fee-free checking and savings accounts to consumers.",
  },
  {
    name: "Discord",
    sector: "Social/Gaming",
    valuation: "~$15B",
    timeline: "Rumored",
    description: "Voice, video, and text communication platform popular with gaming communities.",
  },
  {
    name: "OpenAI",
    sector: "AI",
    valuation: "~$157B",
    timeline: "No Concrete Plans",
    description: "Creator of ChatGPT and GPT-4; exploring for-profit restructuring.",
  },
  {
    name: "Anthropic",
    sector: "AI",
    valuation: "~$61B",
    timeline: "Speculation Only",
    description: "AI safety company and creator of the Claude family of language models.",
  },
];
