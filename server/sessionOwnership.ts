export type SessionSection = "speaking" | "writing" | "reading" | "listening" | "full";
export type QuestionSection = Exclude<SessionSection, "full">;

export function isQuestionAllowedInSession(sessionSection: SessionSection, questionSection: QuestionSection): boolean {
  return sessionSection === "full" || sessionSection === questionSection;
}
