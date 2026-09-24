export type SessionQuestionRef = {
  id: number;
  taskType?: string;
  section?: string;
};

export function buildSessionQuestionUrl(input: {
  sessionId: number;
  questionId: number;
  mode: string;
  mockTest?: boolean;
}): string {
  const mockTestSuffix = input.mockTest ? "&mockTest=true" : "";
  return `/session/${input.sessionId}?questionId=${input.questionId}&mode=${encodeURIComponent(input.mode)}${mockTestSuffix}`;
}

export function resolveSessionQuestionId(...candidates: Array<number | null | undefined>): number | null {
  const validCandidate = candidates.find(candidate => typeof candidate === "number" && Number.isInteger(candidate) && candidate > 0);
  return validCandidate ?? null;
}

export function getAdjacentQuestionIndex(currentIndex: number, totalQuestions: number, direction: "next" | "previous"): number | null {
  const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
  return nextIndex >= 0 && nextIndex < totalQuestions ? nextIndex : null;
}

export function shouldCompleteSession(currentIndex: number, totalQuestions: number): boolean {
  return totalQuestions <= 1 || currentIndex >= totalQuestions - 1;
}
