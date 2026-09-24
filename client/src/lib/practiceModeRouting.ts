export type PracticeMode = "beginner" | "exam" | "diagnostic" | "revision";

export function getDedicatedPracticeModeRoute(mode: PracticeMode): string | null {
  return mode === "revision" ? "/revision" : null;
}
