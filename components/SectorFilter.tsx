"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface SectorFilterProps {
  sectors: string[];
}

export function SectorFilter({ sectors }: SectorFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSector = searchParams.get("sector") || "All";
  const [isPending, startTransition] = useTransition();

  const all = ["All", ...sectors];

  function handleClick(sector: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (sector === "All") {
        params.delete("sector");
      } else {
        params.set("sector", sector);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        opacity: isPending ? 0.7 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {all.map((sector) => {
        const isActive = sector === activeSector;
        return (
          <button
            key={sector}
            onClick={() => handleClick(sector)}
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "#0D0D0D" : "#5A5A5A",
              background: isActive ? "#00FF41" : "#111111",
              border: `1px solid ${isActive ? "#00FF41" : "#252525"}`,
              borderRadius: 20,
              padding: "5px 14px",
              cursor: "pointer",
              transition: "color 0.15s ease, background 0.15s ease, border-color 0.15s ease",
              outline: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.target as HTMLElement).style.color = "#9A9A9A";
                (e.target as HTMLElement).style.borderColor = "#3a3a3a";
                (e.target as HTMLElement).style.background = "#181818";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.target as HTMLElement).style.color = "#5A5A5A";
                (e.target as HTMLElement).style.borderColor = "#252525";
                (e.target as HTMLElement).style.background = "#111111";
              }
            }}
          >
            {sector}
          </button>
        );
      })}
    </div>
  );
}
