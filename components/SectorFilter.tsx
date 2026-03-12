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
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#00FF41" : "#6A6A6A",
              background: isActive ? "#00FF4115" : "#141414",
              border: `1px solid ${isActive ? "#00FF4150" : "#2a2a2a"}`,
              borderRadius: 20,
              padding: "6px 14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.target as HTMLElement).style.color = "#9A9A9A";
                (e.target as HTMLElement).style.borderColor = "#3a3a3a";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.target as HTMLElement).style.color = "#6A6A6A";
                (e.target as HTMLElement).style.borderColor = "#2a2a2a";
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
