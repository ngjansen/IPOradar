import type { IPOStatus } from "@/lib/types";

const BROKER_LINKS = {
  robinhoodStock: (s: string) => `https://robinhood.com/us/en/stocks/${s}/`,
  webullStock: (s: string) =>
    `https://www.webull.com/quote/nasdaq-${s.toLowerCase()}`,
  robinhoodIPOAccess:
    "https://robinhood.com/us/en/support/articles/ipo-access/",
  webullIPOCenter: "https://www.webull.com/quote/us/ipo",
  ibkrAffiliate:
    "https://www.interactivebrokers.com/mkt/?src=ibkrwebu7&url=%2Fen%2Ftrading%2Fnew-issues-ipo.php",
  fidelityOpen: "https://www.fidelity.com/trading/ipos",
};

const linkBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "var(--font-inter)",
  fontSize: 12,
  fontWeight: 500,
  textDecoration: "none",
  borderRadius: 6,
  padding: "7px 14px",
  transition: "opacity 0.15s",
  whiteSpace: "nowrap" as const,
};

const primaryBtn: React.CSSProperties = {
  ...linkBase,
  background: "#00FF41",
  color: "#0D0D0D",
  fontWeight: 700,
};

const secondaryBtn: React.CSSProperties = {
  ...linkBase,
  background: "transparent",
  color: "#9A9A9A",
  border: "1px solid #2A2A2A",
};

interface BrokerCTAProps {
  symbol: string;
  status: IPOStatus;
  company: string;
}

export function BrokerCTA({ symbol, status, company }: BrokerCTAProps) {
  const cardBase: React.CSSProperties = {
    background: "#141414",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 24,
  };

  if (status === "priced") {
    return (
      <div
        style={{
          ...cardBase,
          borderLeft: "3px solid #00FF41",
          boxShadow: "-4px 0 20px #00FF4115",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: 14,
                fontWeight: 700,
                color: "#F0F0F0",
                marginBottom: 3,
              }}
            >
              Trade ${symbol}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#4A4A4A",
              }}
            >
              {company} is live on public markets.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <a
              href={BROKER_LINKS.robinhoodStock(symbol)}
              target="_blank"
              rel="noopener noreferrer"
              style={primaryBtn}
            >
              Open on Robinhood →
            </a>
            <a
              href={BROKER_LINKS.webullStock(symbol)}
              target="_blank"
              rel="noopener noreferrer"
              style={secondaryBtn}
            >
              Webull
            </a>
            <a
              href={BROKER_LINKS.fidelityOpen}
              target="_blank"
              rel="noopener noreferrer"
              style={secondaryBtn}
            >
              Fidelity
            </a>
            <a
              href={BROKER_LINKS.ibkrAffiliate}
              target="_blank"
              rel="noopener noreferrer"
              style={secondaryBtn}
            >
              IBKR†
            </a>
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 10,
            color: "#3A3A3A",
            marginTop: 10,
          }}
        >
          Not financial advice. Do your own research before investing. † affiliate link
        </div>
      </div>
    );
  }

  if (status === "upcoming") {
    return (
      <div style={cardBase}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: 14,
                fontWeight: 700,
                color: "#F0F0F0",
                marginBottom: 3,
              }}
            >
              Prepare to invest in {company}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#4A4A4A",
              }}
            >
              Some brokers let retail investors request shares before the stock lists.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <a
              href={BROKER_LINKS.robinhoodIPOAccess}
              target="_blank"
              rel="noopener noreferrer"
              style={primaryBtn}
            >
              Robinhood IPO Access →
            </a>
            <a
              href={BROKER_LINKS.webullIPOCenter}
              target="_blank"
              rel="noopener noreferrer"
              style={secondaryBtn}
            >
              Webull IPO Center
            </a>
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 10,
            color: "#3A3A3A",
            marginTop: 10,
          }}
        >
          Not financial advice. IPO share access varies by broker and eligibility.
        </div>
      </div>
    );
  }

  // filed
  return (
    <div style={cardBase}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: 14,
              fontWeight: 700,
              color: "#F0F0F0",
              marginBottom: 3,
            }}
          >
            Following this S-1?
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 11,
              color: "#4A4A4A",
            }}
          >
            Open an account now so you&apos;re ready to trade when it prices.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <a
            href={BROKER_LINKS.robinhoodIPOAccess}
            target="_blank"
            rel="noopener noreferrer"
            style={secondaryBtn}
          >
            Robinhood →
          </a>
          <a
            href={BROKER_LINKS.webullIPOCenter}
            target="_blank"
            rel="noopener noreferrer"
            style={secondaryBtn}
          >
            Webull →
          </a>
          <a
            href={BROKER_LINKS.fidelityOpen}
            target="_blank"
            rel="noopener noreferrer"
            style={secondaryBtn}
          >
            Fidelity →
          </a>
          <a
            href={BROKER_LINKS.ibkrAffiliate}
            target="_blank"
            rel="noopener noreferrer"
            style={secondaryBtn}
          >
            IBKR† →
          </a>
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 10,
          color: "#3A3A3A",
          marginTop: 10,
        }}
      >
        Not financial advice. Do your own research before investing. † affiliate link
      </div>
    </div>
  );
}
