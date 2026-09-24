import type { Attempt } from "@/components/AttemptHistory";

export function applyAttemptScore(
  attempts: Attempt[],
  responseId: number,
  normalizedScore?: number,
  transcription?: string,
): Attempt[] {
  return attempts.map(attempt => attempt.id === responseId
    ? {
        ...attempt,
        score: normalizedScore ?? attempt.score,
        maxScore: normalizedScore !== undefined ? 90 : attempt.maxScore,
        transcription: transcription ?? attempt.transcription,
      }
    : attempt
  );
}
