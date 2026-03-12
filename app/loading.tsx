export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 13,
          color: "#00FF41",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        {`> loading...`}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
