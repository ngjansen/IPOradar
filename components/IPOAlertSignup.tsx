"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

interface IPOAlertSignupProps {
  compact?: boolean;
}

export function IPOAlertSignup({ compact = false }: IPOAlertSignupProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setState("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { error?: string }).error || "Something went wrong. Try again.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Check your connection.");
      setState("error");
    }
  }

  if (compact) {
    // Inline banner variant
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          background: "#141414",
          border: "1px solid #222",
          borderRadius: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 160 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00FF41",
              boxShadow: "0 0 6px #00FF41",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "#6A6A6A",
            }}
          >
            Get IPO alerts in your inbox
          </span>
        </div>

        {state === "success" ? (
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              color: "#00FF41",
            }}
          >
            You&apos;re on the list ✓
          </span>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              disabled={state === "loading"}
              style={{
                background: "#0D0D0D",
                border: "1px solid #2A2A2A",
                borderRadius: 6,
                padding: "6px 10px",
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                color: "#F0F0F0",
                outline: "none",
                width: 160,
              }}
            />
            <button
              type="submit"
              disabled={state === "loading"}
              style={{
                background: state === "loading" ? "#1A3A1A" : "#00FF41",
                color: state === "loading" ? "#6A6A6A" : "#0D0D0D",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                fontWeight: 700,
                cursor: state === "loading" ? "not-allowed" : "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {state === "loading" ? "..." : "Notify me"}
            </button>
            {state === "error" && (
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  color: "#FF4444",
                  width: "100%",
                }}
              >
                {errorMsg}
              </span>
            )}
          </form>
        )}
      </div>
    );
  }

  // Default: sidebar card variant
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #222",
        borderRadius: 12,
        padding: "20px 24px",
        marginTop: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#00FF41",
            boxShadow: "0 0 6px #00FF41",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: 13,
            fontWeight: 700,
            color: "#F0F0F0",
          }}
        >
          IPO Alerts
        </span>
      </div>

      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 12,
          color: "#6A6A6A",
          lineHeight: 1.5,
          margin: "0 0 14px 0",
        }}
      >
        Get notified when new IPOs file, price, or go live.
      </p>

      {state === "success" ? (
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            color: "#00FF41",
            padding: "10px 0",
          }}
        >
          You&apos;re on the list ✓
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={state === "loading"}
            style={{
              width: "100%",
              background: "#0D0D0D",
              border: "1px solid #2A2A2A",
              borderRadius: 6,
              padding: "9px 12px",
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              color: "#F0F0F0",
              outline: "none",
              marginBottom: 8,
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={state === "loading"}
            style={{
              width: "100%",
              background: state === "loading" ? "#1A3A1A" : "#00FF41",
              color: state === "loading" ? "#6A6A6A" : "#0D0D0D",
              border: "none",
              borderRadius: 6,
              padding: "9px 0",
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              fontWeight: 700,
              cursor: state === "loading" ? "not-allowed" : "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {state === "loading" ? "Subscribing..." : "Notify me →"}
          </button>
          {state === "error" && (
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#FF4444",
                marginTop: 8,
              }}
            >
              {errorMsg}
            </div>
          )}
        </form>
      )}

      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 10,
          color: "#3A3A3A",
          marginTop: 10,
        }}
      >
        No spam. Unsubscribe anytime.
      </div>
    </div>
  );
}
