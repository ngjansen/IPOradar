# IPO Glossary Tooltips Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add hover tooltips with IPO term definitions to section headings and card data labels.

**Architecture:** A single reusable `Tooltip` client component wraps any label with a `?` icon; hovering shows a dark popover with a definition. Integrated into `SectionHeading` (IPOGrid) and card data labels (IPOCard) via an optional `tooltip` prop pattern.

**Tech Stack:** React (useState for hover), Next.js, inline styles (project convention)

---

### Task 1: Create `components/Tooltip.tsx`

**Files:**
- Create: `components/Tooltip.tsx`

**Step 1: Create the component**

```tsx
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
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
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
          userSelect: "none",
          flexShrink: 0,
          transition: "border-color 0.15s, color 0.15s",
        }}
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
```

Note: the component uses two `onMouseEnter` / `onMouseLeave` handlers. Consolidate into a single pair — the second pair (which also calls setVisible) overrides the first, so remove the first pair from the outer span and keep only the ones on the `?` icon span. The outer `<span>` needs no handlers.

**Corrected component (use this):**

```tsx
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
```

**Step 2: TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit
```
Expected: zero errors

---

### Task 2: Add tooltips to `SectionHeading` in `IPOGrid.tsx`

**Files:**
- Modify: `components/IPOGrid.tsx`

**Step 1: Import Tooltip and add `tooltip` prop to SectionHeading**

Add import at top:
```tsx
import { Tooltip } from "./Tooltip";
```

Update `SectionHeading` interface and component:
```tsx
function SectionHeading({ label, count, dim, tooltip }: { label: string; count: number; dim?: boolean; tooltip?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
      <Tooltip definition={tooltip ?? ""}>
        <h2
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: 13,
            fontWeight: 700,
            color: dim ? "#4A4A4A" : "#F0F0F0",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          {label}
        </h2>
      </Tooltip>
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 11,
          color: "#3A3A3A",
        }}
      >
        {count}
      </span>
    </div>
  );
}
```

**Step 2: Pass definitions to each SectionHeading usage**

For "Confirmed — Date Set":
```tsx
<SectionHeading
  label="Confirmed — Date Set"
  count={filteredUpcoming.length}
  tooltip="These companies have set an official IPO date. Shares will begin trading on the expected date."
/>
```

For "Filed S-1 — Date TBD":
```tsx
<SectionHeading
  label="Filed S-1 — Date TBD"
  count={filteredFiled.length}
  dim
  tooltip="An S-1 is a registration statement filed with the SEC to go public. These companies have filed but haven't set a trading date yet."
/>
```

**Step 3: TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit
```
Expected: zero errors

---

### Task 3: Add tooltips to card data labels in `IPOCard.tsx`

**Files:**
- Modify: `components/IPOCard.tsx`

**Step 1: Import Tooltip**

Add at top:
```tsx
import { Tooltip } from "./Tooltip";
```

**Step 2: Define glossary terms inline (add above `IPOCard` function)**

```tsx
const GLOSSARY: Record<string, string> = {
  "Expected Date": "The scheduled first day of public trading for this IPO.",
  "Price Range": "The per-share price range set by underwriters before the IPO. Final price is set the night before trading begins.",
  "Offer Size": "Total capital the company aims to raise — calculated as shares offered multiplied by the price range midpoint.",
  "Hype Score": "IPOradar signal based on recent news volume. Higher score = more media attention in the past 7 days.",
};
```

**Step 3: Wrap each data label with Tooltip**

Replace each label `<div>` in the upcoming card data grid (e.g. "Expected Date", "Price Range", "Offer Size") and the hype score label with the Tooltip wrapper:

```tsx
// Expected Date label — change from:
<div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
  Expected Date
</div>

// To:
<Tooltip definition={GLOSSARY["Expected Date"]}>
  <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
    Expected Date
  </div>
</Tooltip>
```

Apply same pattern to "Price Range", "Offer Size", and "Hype Score" labels.

**Step 4: TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit
```
Expected: zero errors

---

## Verification Checklist

- [ ] `./node_modules/.bin/tsc --noEmit` → zero errors
- [ ] Hovering `?` next to "Confirmed — Date Set" shows section definition
- [ ] Hovering `?` next to "Filed S-1 — Date TBD" shows S-1 definition
- [ ] Hovering "Expected Date" label on upcoming card shows definition
- [ ] Hovering "Price Range" label shows definition
- [ ] Hovering "Offer Size" label shows definition (only on cards where offer size is visible)
- [ ] Hovering "Hype Score" label shows definition
- [ ] Filed and priced cards are visually unchanged
- [ ] Tooltip does not overflow off-screen on edge cards
