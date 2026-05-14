"use client";

import Link from "next/link";
import type { IPO } from "@/lib/types";
import { colors, fonts } from "@/lib/theme";

interface CalendarViewProps {
  ipos: IPO[];
}

export function CalendarView({ ipos }: CalendarViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const items = ipos.filter((ipo) => ipo.date === iso);
    return { date: d, iso, items };
  });

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${colors.border}` }}>
      {/* Weekday headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        gap: 1, background: colors.border,
      }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} style={{
            background: colors.surfaceHi,
            padding: "8px 10px",
            fontFamily: fonts.mono, fontSize: 9, color: colors.textFaint,
            textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center",
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 1,
        background: colors.border,
      }}>
        {days.map(({ date, items }) => {
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = date.getDate();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isToday = date.getTime() === today.getTime();

          return (
            <div
              key={date.toISOString()}
              style={{
                background: colors.bg,
                minHeight: 100,
                padding: 10,
                opacity: isWeekend ? 0.45 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                <span style={{
                  fontFamily: fonts.display, fontSize: 15, fontWeight: 700, lineHeight: 1,
                  color: isToday ? colors.accent : items.length ? colors.text : colors.textMute,
                  background: isToday ? colors.accentDim : "transparent",
                  borderRadius: 4, padding: isToday ? "2px 5px" : "0",
                }}>{dayNum}</span>
              </div>
              {items.map((ipo) => (
                <Link
                  key={ipo.symbol}
                  href={`/ipo/${ipo.symbol}`}
                  style={{
                    display: "block",
                    background: colors.accentDim,
                    border: `1px solid ${colors.accent}40`,
                    borderRadius: 4, padding: "4px 6px", marginBottom: 3,
                    textDecoration: "none",
                    transition: "background 0.12s",
                  }}
                >
                  <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accent, fontWeight: 700 }}>${ipo.symbol}</div>
                  <div style={{ fontFamily: fonts.ui, fontSize: 10, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ipo.company}</div>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
