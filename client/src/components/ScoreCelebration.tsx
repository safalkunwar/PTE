import { motion, useReducedMotion } from "framer-motion";
import { CELEBRATION_PARTICLES, shouldCelebrateScore } from "@/lib/scoreCelebration";

export function ScoreCelebration({ score }: { score: number | null | undefined }) {
  const reducedMotion = useReducedMotion() ?? false;
  if (!shouldCelebrateScore(score)) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {CELEBRATION_PARTICLES.map((particle, index) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute h-2 w-1.5 rounded-sm"
          style={{ left: particle.left, top: particle.top, backgroundColor: particle.color }}
          initial={reducedMotion ? false : { opacity: 0, y: -8, rotate: particle.rotate }}
          animate={reducedMotion ? undefined : { opacity: [0, 1, 0], y: [0, 18, 44], rotate: [particle.rotate, particle.rotate + 90, particle.rotate + 180] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.8, delay: index * 0.08, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
