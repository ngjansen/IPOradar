"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search company or ticker…" }: SearchBarProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    onSearch(value);
  }, [value, onSearch]);

  return (
    <div style={{ position: "relative" }}>
      {/* Search icon */}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#4A4A4A",
          pointerEvents: "none",
        }}
      >
        <path
          d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.39 10.45L12 13.06L13.06 12L10.45 9.39A5.5 5.5 0 1 0 9.39 10.45Z"
          fill="currentColor"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#141414",
          border: "1px solid #222",
          borderRadius: 10,
          padding: "10px 14px 10px 40px",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 13,
          color: "#F0F0F0",
          outline: "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#00FF4150";
          e.target.style.boxShadow = "0 0 0 3px #00FF4110";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#222";
          e.target.style.boxShadow = "none";
        }}
      />

      {value && (
        <button
          onClick={() => setValue("")}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "#4A4A4A",
            cursor: "pointer",
            padding: 2,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
