import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "IPOradar — Upcoming IPO Calendar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0D0D0D",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.5,
            display: "flex",
          }}
        />

        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 300,
            background: "radial-gradient(ellipse, #00FF4118 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 72,
              fontWeight: 700,
              color: "#F0F0F0",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            IPO
          </span>
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 72,
              fontWeight: 700,
              color: "#00FF41",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            radar
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 26,
            color: "#6A6A6A",
            letterSpacing: "0.02em",
            marginBottom: 48,
          }}
        >
          Real-time IPO calendar for retail investors
        </div>

        {/* Pill badges */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Live Data", "Hype Scores", "AI Analysis", "Free"].map((label) => (
            <div
              key={label}
              style={{
                background: "#141414",
                border: "1px solid #2A2A2A",
                borderRadius: 999,
                padding: "10px 22px",
                fontFamily: "sans-serif",
                fontSize: 16,
                color: "#9A9A9A",
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontFamily: "monospace",
            fontSize: 16,
            color: "#2A2A2A",
            letterSpacing: "0.1em",
          }}
        >
          iporadar.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
