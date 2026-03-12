interface LetterAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const COLORS = [
  "#00FF41", "#00E5FF", "#FF6B6B", "#FFD93D", "#6BCB77",
  "#845EC2", "#FF9671", "#00C9A7", "#C34A36", "#4D8076",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const SIZES = {
  sm: { outer: 36, font: 14 },
  md: { outer: 56, font: 20 },
  lg: { outer: 80, font: 28 },
};

export function LetterAvatar({ name, size = "md" }: LetterAvatarProps) {
  const color = getColorForName(name);
  const initials = getInitials(name);
  const { outer, font } = SIZES[size];

  return (
    <div
      style={{
        width: outer,
        height: outer,
        borderRadius: "12px",
        background: `${color}18`,
        border: `1px solid ${color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: font,
        fontFamily: "var(--font-space-grotesk)",
        fontWeight: 700,
        color,
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}
