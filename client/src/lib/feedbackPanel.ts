export function toggleFeedbackPanel(expanded: boolean): boolean {
  return !expanded;
}

export function getFeedbackAccordionMotion(reducedMotion: boolean) {
  return {
    initial: reducedMotion ? false : { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: reducedMotion ? undefined : { opacity: 0, height: 0 },
    transition: { duration: reducedMotion ? 0 : 0.2 },
  } as const;
}
