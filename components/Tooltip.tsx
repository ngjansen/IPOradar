"use client";

import { useState } from "react";

interface TooltipProps {
  definition: string;
  children: React.ReactNode;
}

export function Tooltip({ definition, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {children}
      <span
        onMouseEnter={(e) => {
          setVisible(true);
          (e.currentTarget as HTMLElement).style.borderColor = "#3A3A3A";
          (e.currentTarget as HTMLElement).style.color = "#9A9A9A";
        }}
        onMouseLeave={(e) => {
          setVisible(false);
          (e.currentTarget as HTMLElement).style.borderColor = "#2A2A2A";
          (e.currentTarget as HTMLElement).style.color = "#4A4A4A";
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "1px solid #2A2A2A",
          background: "#1A1A1A",
          fontFamily: "var(--font-inter)",
          fontSize: 9,
          color: "#4A4A4A",
          cursor: "default",
          userSelect: "none" as const,
          flexShrink: 0,
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        ?
      </span>
      {visible && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 220,
            background: "#141414",
            border: "1px solid #2A2A2A",
            borderRadius: 8,
            padding: "10px 12px",
            fontFamily: "var(--font-inter)",
            fontSize: 11,
            color: "#9A9A9A",
            lineHeight: 1.6,
            zIndex: 200,
            pointerEvents: "none",
            boxShadow: "0 8px 24px #00000080",
            whiteSpace: "normal",
          }}
        >
          {definition}
        </span>
      )}
    </span>
  );
}
