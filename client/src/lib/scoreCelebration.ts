export function shouldCelebrateScore(score: number | null | undefined): boolean {
  return typeof score === "number" && Number.isFinite(score) && score >= 79;
}

export const CELEBRATION_PARTICLES = [
  { left: "8%", top: "12%", color: "#facc15", rotate: -18 },
  { left: "18%", top: "30%", color: "#38bdf8", rotate: 22 },
  { left: "32%", top: "8%", color: "#fb7185", rotate: 12 },
  { left: "48%", top: "25%", color: "#a78bfa", rotate: -12 },
  { left: "64%", top: "10%", color: "#34d399", rotate: 18 },
  { left: "78%", top: "28%", color: "#fbbf24", rotate: -24 },
  { left: "90%", top: "14%", color: "#22d3ee", rotate: 20 },
] as const;
