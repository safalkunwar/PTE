export interface PageTransitionValues {
  initial: { opacity: number; x: number };
  animate: { opacity: number; x: number };
  exit: { opacity: number; x: number };
  transition: { duration: number; ease: [number, number, number, number] };
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function getPageTransition(reducedMotion: boolean): PageTransitionValues {
  if (reducedMotion) {
    return {
      initial: { opacity: 1, x: 0 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 1, x: 0 },
      transition: { duration: 0, ease: EASE_OUT },
    };
  }

  return {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
    transition: { duration: 0.18, ease: EASE_OUT },
  };
}
