export type PracticeMode = "beginner" | "exam" | "diagnostic" | "revision";

export function getDedicatedPracticeModeRoute(mode: PracticeMode): string | null {
  if (mode === "exam") return "/mock-test";
  return mode === "revision" ? "/revision" : null;
}
