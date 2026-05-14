"use client";

import type { ReactNode } from "react";
import { colors, fonts } from "@/lib/theme";
import { LetterAvatar } from "./LetterAvatar";
import { Sparkline } from "./Sparkline";
import type { IPO } from "@/lib/types";

interface HeroDashboardProps {
  upcoming: IPO[];
  filed: IPO[];
  recentIpos: IPO[];
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = new Date(iso + "T00:00:00");
  return Math.ceil((t.getTime() - today.getTime()) / 86400000);
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseOfferAmount(raw: string): number {
  if (!raw) return 0;
  const s = raw.replace("$", "").trim();
  if (s.endsWith("B")) return parseFloat(s) * 1e9;
  if (s.endsWith("M")) return parseFloat(s) * 1e6;
  return parseFloat(s.replace(/,/g, "")) || 0;
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textFaint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: accent ? colors.accent : colors.text, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function PulseTile({ label, value, sub, valueColor }: { label: string; value: string | number; sub: ReactNode; valueColor?: string }) {
  return (
    <div style={{ background: colors.bg, padding: "14px 18px" }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textFaint, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: valueColor ?? colors.text, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontFamily: fonts.ui, fontSize: 11, color: colors.textMute }}>{sub}</span>
      </div>
    </div>
  );
}

export function HeroDashboard({ upcoming, filed, recentIpos }: HeroDashboardProps) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();

  const next = [...upcoming]
    .filter(i => i.date && daysUntil(i.date) >= 0)
    .sort((a, b) => a.date!.localeCompare(b.date!))[0] ?? upcoming[0];

  const days = next?.date ? Math.max(0, daysUntil(next.date)) : 0;
  const thisWeekCount = upcoming.filter(i => i.date && daysUntil(i.date) >= 0 && daysUntil(i.date) <= 7).length;
  const winnersCount = recentIpos.filter(i => (i.perfPct ?? 0) > 0).length;

  const avgPerf = recentIpos.length > 0
    ? recentIpos.reduce((sum, i) => sum + (i.perfPct ?? 0), 0) / recentIpos.length
    : 0;

  const avgPerfStr = avgPerf >= 0 ? `+${avgPerf.toFixed(1)}%` : `${avgPerf.toFixed(1)}%`;

  const hypeTrend = [3, 4, 6, 5, 8, 12, 18];

  const topHypeScore = upcoming.length > 0
    ? Math.max(...upcoming.map(i => i.hypeScore ?? 0))
    : 0;

  const totalPipeline = upcoming.length + filed.length;

  return (
    <section style={{
      background: `radial-gradient(ellipse 100% 60% at 30% 0%, ${colors.accent}08, transparent 60%), ${colors.bg}`,
      borderBottom: `1px solid ${colors.border}`,
      padding: "32px 24px 0",
    }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* Pre-title */}
        <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accent, opacity: 0.6, letterSpacing: "0.18em", marginBottom: 10 }}>
          // IPO INTELLIGENCE · {dateLabel}
        </div>

        {/* Title row + featured next IPO */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "end", marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontFamily: fonts.display, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700,
              color: colors.text, letterSpacing: "-0.04em", lineHeight: 1.05, margin: 0,
            }}>
              {totalPipeline} IPOs in the pipeline.
              <br />
              <span style={{ color: colors.textMute }}>Next debut in </span>
              <span style={{ color: colors.accent }}>{days} day{days !== 1 ? "s" : ""}</span>
              <span style={{ color: colors.accent, animation: "blink 1.2s step-end infinite" }}>_</span>
            </h1>
          </div>

          {/* Featured next IPO card */}
          {next && (
            <div style={{
              background: `linear-gradient(135deg, ${colors.surface}, ${colors.bg})`,
              border: `1px solid ${colors.accent}40`,
              borderTop: `2px solid ${colors.accent}`,
              borderRadius: 12,
              padding: "16px 20px",
              minWidth: 280,
              maxWidth: 320,
              boxShadow: `0 0 0 1px ${colors.accent}15 inset, 0 8px 32px ${colors.accent}10`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <LetterAvatar name={next.company} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {next.company}
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.accent }}>
                    ${next.symbol} · {next.exchange?.replace("NASDAQ Global Select", "NASDAQ").replace("NASDAQ Global", "NASDAQ").replace("NYSE American", "NYSE") ?? "—"}
                  </div>
                </div>
                <span style={{
                  fontFamily: fonts.mono, fontSize: 9, fontWeight: 700, color: "#000",
                  background: colors.accent, padding: "3px 7px", borderRadius: 4, letterSpacing: "0.1em",
                }}>NEXT</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <StatCell label="Date" value={next.date ? fmtDate(next.date) : "TBD"} accent />
                <StatCell label="Range" value={next.priceRange?.replace(/\.00/g, "").replace(" – ", "–") ?? "TBD"} />
                <StatCell label="Raise" value={next.offerAmount ?? "—"} />
              </div>
            </div>
          )}
        </div>

        {/* Pulse strip */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 1,
          background: colors.border,
          border: `1px solid ${colors.border}`,
          borderRadius: "10px 10px 0 0",
          overflow: "hidden",
          marginBottom: -1,
        }}>
          <PulseTile label="THIS WEEK" value={thisWeekCount} sub="confirmed" valueColor={thisWeekCount > 0 ? colors.text : colors.textMute} />
          <PulseTile label="FILED" value={filed.length} sub="awaiting date" />
          <PulseTile
            label="HYPE INDEX"
            value={topHypeScore >= 12 ? "HOT" : topHypeScore.toFixed(1)}
            valueColor={topHypeScore >= 12 ? colors.accent : colors.textDim}
            sub={<Sparkline values={hypeTrend} width={70} height={14} />}
          />
          <PulseTile
            label="WINNERS"
            value={winnersCount}
            sub={`of ${recentIpos.length} recent`}
            valueColor={winnersCount > recentIpos.length / 2 ? colors.accent : colors.text}
          />
          <PulseTile
            label="AVG 1ST DAY"
            value={recentIpos.length > 0 ? avgPerfStr : "—"}
            sub="last 90 days"
            valueColor={avgPerf >= 0 ? colors.accent : colors.danger}
          />
        </div>
      </div>
    </section>
  );
}
