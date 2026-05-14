"use client";

import { colors, fonts } from "@/lib/theme";

interface HypeMeterProps {
  score: number;
  newsCount: number;
}

export function HypeMeter({ score, newsCount }: HypeMeterProps) {
  const segments = 12;
  const filled = Math.min(segments, Math.round((score / 20) * segments));
  const isHot = score >= 12;
  const isWarm = score >= 6;
  const color = isHot ? colors.accent : isWarm ? "#7AE0A0" : colors.textMute;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textFaint, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Hype
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, color, letterSpacing: "-0.02em" }}>
            {score.toFixed(1)}
          </span>
          {isHot && (
            <span style={{
              fontFamily: fonts.mono, fontSize: 8, fontWeight: 700, color: "#000",
              background: colors.accent, padding: "1px 5px", borderRadius: 3,
              letterSpacing: "0.08em",
            }}>HOT</span>
          )}
        </div>
        <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textMute }}>
          {newsCount} articles · 7d
        </span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 1,
              background: i < filled ? color : colors.border,
              boxShadow: i < filled && isHot ? `0 0 4px ${color}80` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
