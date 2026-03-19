import type { IPOAnalysis, AnalysisVerdict } from "@/lib/types";

const VERDICT_STYLES: Record<
  AnalysisVerdict,
  { color: string; bg: string; border: string; label: string }
> = {
  BUY_NOW:   { color: "#00FF41", bg: "#00FF4112", border: "#00FF4130", label: "BUY NOW" },
  WAIT:      { color: "#FFB800", bg: "#FFB80012", border: "#FFB80030", label: "WAIT" },
  PASS:      { color: "#6A6A6A", bg: "#6A6A6A12", border: "#6A6A6A30", label: "PASS" },
  HIGH_RISK: { color: "#FF4444", bg: "#FF444412", border: "#FF444430", label: "HIGH RISK" },
};

const CONFIDENCE_DOTS: Record<"LOW" | "MEDIUM" | "HIGH", number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export function IPOAnalysisCard({ analysis }: { analysis: IPOAnalysis }) {
  const vs = VERDICT_STYLES[analysis.verdict];
  const filledDots = CONFIDENCE_DOTS[analysis.confidence];

  return (
    <div
      style={{
        background: "#141414",
        border: `1px solid ${vs.border}`,
        borderLeft: `3px solid ${vs.color}`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 28,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#00FF41",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          AI ANALYSIS
        </span>

        {/* Verdict badge */}
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            fontWeight: 700,
            color: vs.color,
            background: vs.bg,
            border: `1px solid ${vs.border}`,
            borderRadius: 4,
            padding: "3px 10px",
            letterSpacing: "0.06em",
          }}
        >
          {vs.label}
        </span>

        {/* Verdict label */}
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            color: "#C0C0C0",
          }}
        >
          {analysis.verdictLabel}
        </span>

        {/* Confidence dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: "auto",
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: n <= filledDots ? vs.color : "#2A2A2A",
                border: `1px solid ${n <= filledDots ? vs.color : "#3A3A3A"}`,
              }}
            />
          ))}
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 9,
              color: "#4A4A4A",
              letterSpacing: "0.08em",
              marginLeft: 4,
            }}
          >
            {analysis.confidence} CONF.
          </span>
        </div>
      </div>

      {/* Summary */}
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          color: "#B0B0B0",
          lineHeight: 1.7,
          margin: "0 0 18px 0",
        }}
      >
        {analysis.summary}
      </p>

      {/* Bull / Bear grid */}
      <div className="analysis-bull-bear">
        {/* Bull case */}
        <div
          style={{
            background: "#00FF4108",
            border: "1px solid #00FF4120",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              color: "#00FF41",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            BULL CASE
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
            {analysis.bullCase.map((item, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  color: "#9AE0A0",
                  lineHeight: 1.5,
                  display: "flex",
                  gap: 8,
                }}
              >
                <span style={{ color: "#00FF41", flexShrink: 0 }}>+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bear case */}
        <div
          style={{
            background: "#FF444408",
            border: "1px solid #FF444420",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              color: "#FF4444",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            BEAR CASE
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
            {analysis.bearCase.map((item, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  color: "#E09A9A",
                  lineHeight: 1.5,
                  display: "flex",
                  gap: 8,
                }}
              >
                <span style={{ color: "#FF4444", flexShrink: 0 }}>−</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Risks */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            color: "#6A6A6A",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          KEY RISKS
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {analysis.keyRisks.map((risk, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                color: "#7A7A7A",
                lineHeight: 1.5,
                display: "flex",
                gap: 8,
              }}
            >
              <span style={{ color: "#6A6A6A", flexShrink: 0 }}>!</span>
              {risk}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #1E1E1E",
          marginTop: 16,
          paddingTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            color: "#4A4A4A",
          }}
        >
          {analysis.timeHorizon}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 10,
            color: "#3A3A3A",
          }}
        >
          AI-generated analysis. Not financial advice.
        </span>
      </div>

      <style>{`
        .analysis-bull-bear {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .analysis-bull-bear {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
