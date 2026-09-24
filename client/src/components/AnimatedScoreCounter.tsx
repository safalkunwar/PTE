import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function formatScore(value: number | null | undefined, fallback = "—"): string {
  return typeof value === "number" && Number.isFinite(value) ? String(Math.round(value)) : fallback;
}

interface AnimatedScoreCounterProps {
  value: number | null | undefined;
  className?: string;
  suffix?: string;
  ariaLabel?: string;
  style?: CSSProperties;
}

export function AnimatedScoreCounter({ value, className, suffix = "", ariaLabel, style }: AnimatedScoreCounterProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const target = typeof value === "number" && Number.isFinite(value) ? value : null;
  const previousTarget = useRef(target ?? 0);
  const [displayValue, setDisplayValue] = useState(target);

  useEffect(() => {
    if (target === null) {
      setDisplayValue(null);
      return;
    }

    if (reducedMotion) {
      previousTarget.current = target;
      setDisplayValue(target);
      return;
    }

    const from = previousTarget.current;
    const duration = 420;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previousTarget.current = target;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, target]);

  const formatted = formatScore(displayValue);
  return (
    <motion.span
      className={className}
      style={style}
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      aria-label={ariaLabel ?? (target === null ? "No score" : `Score ${formatScore(target)}${suffix}`)}
      aria-live="polite"
    >
      {formatted}{target === null ? "" : suffix}
    </motion.span>
  );
}
