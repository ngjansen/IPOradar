import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 72,
          fontWeight: 700,
          color: "#1A1A1A",
          lineHeight: 1,
          marginBottom: 16,
        }}
      >
        404
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 14,
          color: "#00FF41",
          marginBottom: 8,
        }}
      >
        {`> IPO not found`}
      </div>
      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          color: "#4A4A4A",
          marginBottom: 32,
        }}
      >
        This company may not be in the upcoming calendar.
      </div>
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 13,
          color: "#0D0D0D",
          background: "#00FF41",
          padding: "10px 24px",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to IPO Calendar
      </Link>
    </div>
  );
}
