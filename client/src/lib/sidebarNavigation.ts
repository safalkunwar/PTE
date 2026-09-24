export function getSidebarHighlightMotion(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1, scaleY: 1 },
      animate: { opacity: 1, scaleY: 1 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, scaleY: 0.35 },
    animate: { opacity: 1, scaleY: 1 },
    transition: { type: "spring" as const, stiffness: 420, damping: 30 },
  };
}
